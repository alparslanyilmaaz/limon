use std::error::Error as StdError;
use std::time::{Duration, Instant};
use crate::AppState;

#[derive(serde::Serialize)]
pub struct HttpResponse {
    pub status: u16,
    pub headers: Vec<(String, String)>,
    pub body: String,
    pub elapsed_ms: u64,
    pub size_bytes: usize,
}

fn fmt_error(e: reqwest::Error, timeout_ms: Option<u64>) -> String {
    if e.is_timeout() {
        return format!("Request timed out after {}ms", timeout_ms.unwrap_or(0));
    }
    if e.is_connect() {
        let mut src: Option<&dyn StdError> = e.source();
        while let Some(err) = src {
            let msg = err.to_string().to_lowercase();
            if msg.contains("certificate")
                || msg.contains("self signed")
                || msg.contains("self-signed")
                || msg.contains("unknown issuer")
                || msg.contains("cert")
                || msg.contains("invalid certificate")
            {
                return "SSL certificate verification failed".to_string();
            }
            src = err.source();
        }
        return "Failed to connect to server".to_string();
    }
    let s = e.to_string();
    if let Some(idx) = s.find("): ") {
        return s[idx + 3..].trim().to_string();
    }
    s
}

#[tauri::command]
pub async fn cancel_request(state: tauri::State<'_, AppState>) -> Result<(), String> {
    if let Some(tx) = state.cancel_tx.lock().unwrap().take() {
        let _ = tx.send(());
    }
    Ok(())
}

#[tauri::command]
pub async fn send_request(
    state: tauri::State<'_, AppState>,
    method: String,
    url: String,
    headers: Vec<(String, String)>,
    body: Option<String>,
    timeout_ms: Option<u64>,
    follow_redirects: bool,
    verify_ssl: bool,
    proxy_url: Option<String>,
    max_redirects: u32,
    user_agent: Option<String>,
    response_size_limit_mb: u64,
) -> Result<HttpResponse, String> {
    let redirect_policy = if follow_redirects {
        reqwest::redirect::Policy::limited(max_redirects as usize)
    } else {
        reqwest::redirect::Policy::none()
    };

    let mut builder = reqwest::Client::builder()
        .danger_accept_invalid_certs(!verify_ssl)
        .redirect(redirect_policy);

    if let Some(ref proxy) = proxy_url {
        builder = builder.proxy(
            reqwest::Proxy::all(proxy).map_err(|e| format!("Invalid proxy URL: {}", e))?
        );
    }

    if let Some(ref ua) = user_agent {
        builder = builder.user_agent(ua);
    }

    let client = builder.build().map_err(|e| e.to_string())?;

    let reqwest_method = reqwest::Method::from_bytes(method.as_bytes())
        .map_err(|e| e.to_string())?;

    let mut req = client.request(reqwest_method, &url);

    for (key, value) in &headers {
        req = req.header(key, value);
    }

    if let Some(b) = body {
        req = req.body(b);
    }

    if let Some(ms) = timeout_ms {
        req = req.timeout(Duration::from_millis(ms));
    }

    let (tx, rx) = tokio::sync::oneshot::channel::<()>();
    {
        let mut guard = state.cancel_tx.lock().unwrap();
        if let Some(prev) = guard.take() {
            let _ = prev.send(());
        }
        *guard = Some(tx);
    }

    let request_future = async {
        let start = Instant::now();
        let response = req.send().await.map_err(|e| fmt_error(e, timeout_ms))?;

        let status = response.status().as_u16();
        let resp_headers: Vec<(String, String)> = response
            .headers()
            .iter()
            .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
            .collect();

        let bytes = response.bytes().await.map_err(|e| fmt_error(e, timeout_ms))?;
        let elapsed_ms = start.elapsed().as_millis() as u64;
        let size_bytes = bytes.len();
        let size_limit = (response_size_limit_mb * 1024 * 1024) as usize;
        let body_bytes = if bytes.len() > size_limit { bytes.slice(..size_limit) } else { bytes };
        let body = String::from_utf8_lossy(&body_bytes).into_owned();

        Ok::<HttpResponse, String>(HttpResponse {
            status,
            headers: resp_headers,
            body,
            elapsed_ms,
            size_bytes,
        })
    };

    tokio::select! {
        result = request_future => {
            let _ = state.cancel_tx.lock().unwrap().take();
            result
        }
        _ = rx => {
            Err("Request cancelled".to_string())
        }
    }
}
