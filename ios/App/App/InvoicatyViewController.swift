import UIKit
import WebKit
import Capacitor

class InvoicatyViewController: CAPBridgeViewController, WKNavigationDelegate {

    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Set ourselves as the navigation delegate
        webView?.navigationDelegate = self
        
        // After Capacitor loads, navigate to the live site inside the WebView
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            if let url = URL(string: "https://invoicaty.com") {
                self.webView?.load(URLRequest(url: url))
            }
        }
    }

    // Keep all navigation inside the WebView — never open Safari
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }

        let host = url.host?.lowercased() ?? ""

        // Allow invoicaty.com and its subdomains
        if host == "invoicaty.com" || host.hasSuffix(".invoicaty.com") {
            decisionHandler(.allow)
            return
        }

        // Allow Supabase auth
        if host.hasSuffix(".supabase.co") || host.hasSuffix(".supabase.com") {
            decisionHandler(.allow)
            return
        }

        // Allow Google/Apple sign-in flows
        if host.hasSuffix(".google.com") || host.hasSuffix(".apple.com") || host.hasSuffix("appleid.apple.com") {
            decisionHandler(.allow)
            return
        }

        // Allow capacitor local scheme
        if url.scheme == "capacitor" {
            decisionHandler(.allow)
            return
        }

        // Allow about:blank and data URLs
        if url.scheme == "about" || url.scheme == "data" {
            decisionHandler(.allow)
            return
        }

        // Everything else: open in external browser
        if UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
        }
        decisionHandler(.cancel)
    }
}
