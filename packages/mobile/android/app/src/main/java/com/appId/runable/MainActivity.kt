package com.appId.runable

import android.app.Activity
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.TextView

class MainActivity : Activity() {
  private var webView: WebView? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    window.statusBarColor = Color.rgb(4, 9, 18)
    window.navigationBarColor = Color.rgb(4, 9, 18)
    openLocalGame()
  }

  private fun openLocalGame() {
    try {
      val view = WebView(this)
      webView = view
      view.setBackgroundColor(Color.rgb(4, 9, 18))
      view.setLayerType(View.LAYER_TYPE_SOFTWARE, null)
      view.settings.javaScriptEnabled = true
      view.settings.domStorageEnabled = true
      view.settings.allowFileAccess = true
      view.settings.allowContentAccess = true
      view.settings.allowFileAccessFromFileURLs = true
      view.settings.allowUniversalAccessFromFileURLs = true
      view.settings.mediaPlaybackRequiresUserGesture = false
      CookieManager.getInstance().setAcceptCookie(true)
      view.webChromeClient = WebChromeClient()
      view.webViewClient = object : WebViewClient() {
        override fun shouldOverrideUrlLoading(v: WebView, request: WebResourceRequest): Boolean {
          return false
        }
      }
      setContentView(view)
      view.loadUrl("file:///android_asset/game/index.html")
    } catch (error: Throwable) {
      val fallback = TextView(this)
      fallback.setTextColor(Color.WHITE)
      fallback.setBackgroundColor(Color.rgb(4, 9, 18))
      fallback.textSize = 16f
      fallback.text = "CAMPEÕES MECHA\n\nNão foi possível iniciar a arena local.\n${error.message ?: "erro nativo"}"
      fallback.setPadding(32, 64, 32, 32)
      setContentView(fallback)
    }
  }

  override fun onBackPressed() {
    val view = webView
    if (view?.canGoBack() == true) view.goBack() else super.onBackPressed()
  }

  override fun onDestroy() {
    webView?.apply { stopLoading(); destroy() }
    webView = null
    super.onDestroy()
  }
}
