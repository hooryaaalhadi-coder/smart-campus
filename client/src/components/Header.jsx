import {
  Navbar,
  Nav,
  NavItem,
  NavLink,
  NavbarToggler,
  Collapse,
  Badge,
} from "reactstrap";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../api/api";
import logo from "../assets/smart-campus-logo.png";
import { CgProfile } from "react-icons/cg";
import { MdOutlineNotifications } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/UserSlice";
import ThemeToggle from "./ThemeToggle";
import {
  getReadNotificationIds,
  markNotificationIdRead as persistNotificationRead,
  markAllNotificationIdsRead as persistAllNotificationsRead,
} from "../notificationsStorage";

function mapServerRows(rows, userId, readSet) {
  return rows.map((row) => ({
    id: String(row._id),
    title: row.title,
    body: row.body,
    to:
      row.link && String(row.link).startsWith("/") ? row.link : "/home",
    read: readSet.has(String(row._id)),
    sortKey: row.createdAt ? new Date(row.createdAt).getTime() : 0,
  }));
}

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [serverRows, setServerRows] = useState([]);
  const [notifFetchError, setNotifFetchError] = useState(false);
  const [readBump, setReadBump] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((s) => s.user.user);
  const listingLocal = useSelector((s) => s.listingNotifications.items);
  const displayName = [user?.firstname, user?.lastname]
    .filter(Boolean)
    .join(" ")
    .trim();

  const hideMainNav = location.pathname === "/admin";

  const loadServerNotifications = useCallback(async () => {
    if (!user?._id) {
      setServerRows([]);
      return;
    }
    try {
      const res = await API.get("/notifications");
      const rows = Array.isArray(res.data) ? res.data : [];
      setServerRows(rows);
      setNotifFetchError(false);
    } catch {
      setServerRows([]);
      setNotifFetchError(true);
    }
  }, [user?._id]);

  useEffect(() => {
    loadServerNotifications();
  }, [loadServerNotifications, location.pathname]);

  useEffect(() => {
    if (notificationsOpen) loadServerNotifications();
  }, [notificationsOpen, loadServerNotifications]);

  const mergedNotifications = useMemo(() => {
    if (!user?._id) return [];
    const readSet = getReadNotificationIds(user._id);
    const fromServer = mapServerRows(serverRows, user._id, readSet);
    const fromLocal = listingLocal
      .filter((i) => String(i.userId) === String(user._id))
      .map((i) => ({
        id: i.id,
        title: i.title,
        body: i.body,
        to: i.to,
        read: readSet.has(i.id),
        sortKey: i.createdAt || 0,
      }));
    return [...fromServer, ...fromLocal].sort(
      (a, b) => b.sortKey - a.sortKey
    );
  }, [serverRows, listingLocal, user?._id, readBump]);

  const unreadCount = useMemo(
    () => mergedNotifications.filter((n) => !n.read).length,
    [mergedNotifications]
  );

  const markNotificationRead = (id) => {
    if (user?._id) persistNotificationRead(user._id, id);
    setReadBump((x) => x + 1);
  };

  const markAllNotificationsRead = () => {
    if (user?._id)
      persistAllNotificationsRead(
        user._id,
        mergedNotifications.map((n) => n.id)
      );
    setReadBump((x) => x + 1);
  };

  const toggleProfile = () => {
    setDropdownOpen((v) => !v);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen((v) => !v);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    setNotificationsOpen(false);
    navigate("/");
  };

  return (
    <Navbar expand="md" className="px-4 py-3 app-navbar app-navbar-compact">

      {/* Logo */}
      <Link to="/home" className="d-flex align-items-center text-decoration-none">
        <img src={logo} alt="logo" className="app-navbar-logo" />
      </Link>

      {/* Toggle */}
      <NavbarToggler
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      />

      {/* Collapse */}
      <Collapse isOpen={isOpen} navbar className="app-navbar-collapse">

        {!hideMainNav ? (
          <Nav className="mx-auto text-center app-navbar-nav" navbar>
            <NavItem>
              <NavLink
                tag={Link}
                to="/home"
                className="fw-bold px-4"
                onClick={() => setIsOpen(false)}
              >
                Home
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag={Link}
                to="/lost"
                className="fw-bold px-4"
                onClick={() => setIsOpen(false)}
              >
                Lost
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag={Link}
                to="/found"
                className="fw-bold px-4"
                onClick={() => setIsOpen(false)}
              >
                Found
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag={Link}
                to="/about"
                className="fw-bold px-4"
                onClick={() => setIsOpen(false)}
              >
                About
              </NavLink>
            </NavItem>
          </Nav>
        ) : null}

        {/* Right Side */}
        <div className={`header-right${hideMainNav ? " ms-auto" : ""}`}>
          <ThemeToggle />

          <div className="header-notifications-block">
            <button
              type="button"
              className="notification-trigger"
              onClick={toggleNotifications}
              aria-expanded={notificationsOpen}
              aria-label="Notifications"
            >
              <MdOutlineNotifications size={32} color="#16a184" />
              {unreadCount > 0 ? (
                <Badge
                  pill
                  color="danger"
                  className="notification-badge"
                  aria-hidden
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              ) : null}
            </button>

            {notificationsOpen && (
              <div className="notification-menu" role="dialog" aria-label="Notifications list">
                <div className="notification-menu-header">
                  <span className="fw-bold">Notifications</span>
                  {unreadCount > 0 ? (
                    <button
                      type="button"
                      className="notification-mark-all"
                      onClick={markAllNotificationsRead}
                    >
                      Mark all read
                    </button>
                  ) : null}
                </div>
                <div className="notification-menu-body">
                  {notifFetchError && mergedNotifications.length > 0 ? (
                    <p className="text-warning small mb-0 px-2 py-2 border-bottom">
                      Could not refresh admin announcements; showing saved items.
                    </p>
                  ) : null}
                  {mergedNotifications.length === 0 ? (
                    <p className="text-muted small mb-0 px-2 py-3 text-center">
                      {notifFetchError ? (
                        "Could not load announcements from the server."
                      ) : (
                        <>
                          No notifications yet. When you publish a listing, a
                          confirmation appears here. Admins can broadcast from{" "}
                          <Link to="/admin" onClick={() => setIsOpen(false)}>
                            Admin
                          </Link>
                          .
                        </>
                      )}
                    </p>
                  ) : (
                    mergedNotifications.map((n) => (
                      <Link
                        key={n.id}
                        to={n.to}
                        className={`notification-item${n.read ? "" : " notification-item-unread"}`}
                        onClick={() => {
                          markNotificationRead(n.id);
                          setNotificationsOpen(false);
                          setIsOpen(false);
                        }}
                      >
                        <span className="notification-item-title">{n.title}</span>
                        <span className="notification-item-body">{n.body}</span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="header-user-block">
            {displayName ? (
              <span className="header-user-name" title={displayName}>
                {displayName}
              </span>
            ) : null}
            <button
              type="button"
              className="profile-trigger"
              onClick={toggleProfile}
              aria-label="Profile menu"
            >
              <CgProfile size={32} color="#16a184" />
            </button>

            {dropdownOpen && (
              <div className="profile-menu">
                <Link to="/profile" onClick={() => { setDropdownOpen(false); setNotificationsOpen(false); }}>
                  Edit Profile
                </Link>

                <hr />

                <button
                  type="button"
                  className="profile-menu-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

      </Collapse>
    </Navbar>
  );
};

export default Header;
