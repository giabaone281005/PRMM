package vn.mohoc.mo_hoc

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "mohoc/app-identity")
            .setMethodCallHandler { call, result ->
                if (call.method == "packageName") result.success(packageName)
                else result.notImplemented()
            }
    }
}
