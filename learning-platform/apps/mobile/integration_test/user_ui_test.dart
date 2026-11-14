import 'user_ui_smoke.dart' as smoke;
import 'user_ui_catalog.dart' as catalog;

Future<void> main() async {
  if (const bool.fromEnvironment('UI_SMOKE')) {
    smoke.main();
  } else {
    catalog.main();
  }
}
