/* ─────────────────────────────────────────────────────────────
   shared/nav.css
   Injected by shared/nav.js into every tool page.
   Google Material Design top app bar aesthetic.
───────────────────────────────────────────────────────────── */

.fc-site-nav {
  position: sticky;
  top: 0;
  z-index: 9999;
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
  background: rgba(26, 26, 26, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-family: 'Google Sans', 'DM Sans', 'Roboto', system-ui, sans-serif;
  box-sizing: border-box;
  width: 100%;
}

.fc-site-nav * {
  box-sizing: border-box;
}

.fc-nav-back {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px 6px 8px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.01em;
}

.fc-nav-back:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.95);
}

.fc-nav-back svg {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.fc-nav-sep {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.2);
  user-select: none;
  flex-shrink: 0;
}

.fc-nav-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0;
}

.fc-nav-spacer {
  flex: 1;
}

.fc-nav-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.fc-nav-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.fc-nav-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.95);
}

@media (max-width: 480px) {
  .fc-nav-name {
    font-size: 13px;
    max-width: 160px;
  }
}
