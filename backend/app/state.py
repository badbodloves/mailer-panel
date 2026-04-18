"""Global application state — shared between routes and the mailer thread."""
import threading
from typing import Optional

lock = threading.Lock()
mailer_core = None  # type: Optional[object]
mailer_thread = None  # type: Optional[threading.Thread]
running = False
started_at = 0.0
last_error = ""
