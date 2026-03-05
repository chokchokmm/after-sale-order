import time
import threading
from typing import Optional

STATE_TIMEOUT = 600  # 10 minutes

_state_store: dict[str, float] = {}
_state_lock = threading.Lock()


def generate_state() -> str:
    """Generate and store a new state value."""
    import secrets
    state = secrets.token_urlsafe(16)
    with _state_lock:
        _state_store[state] = time.time()
    return state


def validate_state(state: str) -> bool:
    """Validate state and remove it after validation (one-time use)."""
    with _state_lock:
        if state not in _state_store:
            return False
        
        timestamp = _state_store.pop(state)
        
        if time.time() - timestamp > STATE_TIMEOUT:
            return False
        
        return True


def cleanup_expired_states():
    """Remove expired states from store."""
    current_time = time.time()
    with _state_lock:
        expired = [s for s, t in _state_store.items() if current_time - t > STATE_TIMEOUT]
        for s in expired:
            del _state_store[s]
