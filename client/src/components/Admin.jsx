import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api/api";
import moment from "moment";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import { useSelector } from "react-redux";

function trunc(s, max) {
  const t = String(s ?? "");
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

const Admin = () => {
  const user = useSelector((s) => s.user.user);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("/home");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  const [itemsFilter, setItemsFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");
  const [rowBusyId, setRowBusyId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadList = useCallback(async () => {
    setListLoading(true);
    setError("");
    try {
      const res = await API.get("/notifications");
      setList(Array.isArray(res.data) ? res.data : []);
    } catch {
      setList([]);
      setError("Could not load notifications.");
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    if (!user?._id || !user.isAdmin) return;
    setStatsLoading(true);
    setStatsError("");
    try {
      const res = await API.get("/admin/stats", {
        params: { adminUserId: user._id },
      });
      setStats(res.data);
    } catch {
      setStats(null);
      setStatsError("Could not load dashboard stats.");
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  const loadItems = useCallback(async () => {
    if (!user?._id || !user.isAdmin) return;
    setItemsLoading(true);
    setItemsError("");
    try {
      const res = await API.get("/admin/items", {
        params: {
          adminUserId: user._id,
          type: itemsFilter,
          q: debouncedSearch || undefined,
        },
      });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setItems([]);
      setItemsError("Could not load listings.");
    } finally {
      setItemsLoading(false);
    }
  }, [user, itemsFilter, debouncedSearch]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    const id = requestAnimationFrame(() => {
      loadList();
    });
    return () => cancelAnimationFrame(id);
  }, [user?.isAdmin, loadList]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    const id = requestAnimationFrame(() => {
      loadStats();
    });
    return () => cancelAnimationFrame(id);
  }, [user?.isAdmin, loadStats]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    const id = requestAnimationFrame(() => {
      loadItems();
    });
    return () => cancelAnimationFrame(id);
  }, [user?.isAdmin, loadItems]);

  const refreshDashboard = useCallback(async () => {
    await Promise.all([loadStats(), loadItems()]);
  }, [loadStats, loadItems]);

  const chartPercents = useMemo(() => {
    if (!stats) return { lostPct: 0, foundPct: 0, total: 0 };
    const total = stats.lostVisible + stats.foundVisible;
    if (!total) return { lostPct: 0, foundPct: 0, total: 0 };
    return {
      lostPct: (stats.lostVisible / total) * 100,
      foundPct: (stats.foundVisible / total) * 100,
      total,
    };
  }, [stats]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!user?._id || !user.isAdmin) return;
    setSending(true);
    setMessage("");
    setError("");
    try {
      await API.post("/admin/notifications", {
        adminUserId: user._id,
        title: title.trim(),
        body: body.trim(),
        link,
      });
      setMessage("Notification sent to all users.");
      setTitle("");
      setBody("");
      setLink("/home");
      await loadList();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not send notification."
      );
    } finally {
      setSending(false);
    }
  };

  const setListingHidden = async (id, hidden) => {
    if (!user?._id) return;
    setRowBusyId(id);
    setItemsError("");
    try {
      await API.patch(`/admin/items/${id}`, {
        adminUserId: user._id,
        hidden,
      });
      await refreshDashboard();
    } catch (err) {
      setItemsError(
        err.response?.data?.message || "Could not update listing."
      );
    } finally {
      setRowBusyId(null);
    }
  };

  const deleteListing = async (id) => {
    if (!user?._id) return;
    if (
      !window.confirm(
        "Permanently delete this listing? This cannot be undone."
      )
    ) {
      return;
    }
    setRowBusyId(id);
    setItemsError("");
    try {
      await API.delete(`/admin/items/${id}`, {
        data: { adminUserId: user._id },
      });
      await refreshDashboard();
    } catch (err) {
      setItemsError(
        err.response?.data?.message || "Could not delete listing."
      );
    } finally {
      setRowBusyId(null);
    }
  };

  if (!user?.isAdmin) {
    return (
      <Container className="py-5">
        <Alert color="warning">You do not have admin access.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4 py-md-5" fluid="lg">
      <Row className="g-3 mb-4">
        <Col xs={12}>
          <div className="admin-dashboard-hero">
            <p className="admin-dashboard-eyebrow">Administrator</p>
            <h1 className="admin-dashboard-title">Admin dashboard</h1>
            <p className="admin-dashboard-lede">
              Overview, listings moderation, and campus notifications.
            </p>
          </div>
        </Col>
        {statsError ? (
          <Col xs={12}>
            <Alert color="danger" className="mb-0 py-2">
              {statsError}
            </Alert>
          </Col>
        ) : null}
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <div className="text-muted small">Registered users</div>
              {statsLoading ? (
                <Spinner color="secondary" size="sm" className="mt-2" />
              ) : (
                <div className="display-6 fw-bold text-primary">
                  {stats?.userCount ?? "—"}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <div className="text-muted small">Visible listings</div>
              {statsLoading ? (
                <Spinner color="secondary" size="sm" className="mt-2" />
              ) : (
                <>
                  <div className="display-6 fw-bold text-success">
                    {stats?.listingVisibleCount ?? "—"}
                  </div>
                  <div className="small text-muted">
                    Lost {stats?.lostVisible ?? 0} · Found{" "}
                    {stats?.foundVisible ?? 0}
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <div className="text-muted small">Private (moderation)</div>
              {statsLoading ? (
                <Spinner color="secondary" size="sm" className="mt-2" />
              ) : (
                <div className="display-6 fw-bold text-warning">
                  {stats?.hiddenListings ?? "—"}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <div className="text-muted small">All listings (DB)</div>
              {statsLoading ? (
                <Spinner color="secondary" size="sm" className="mt-2" />
              ) : (
                <div className="display-6 fw-bold text-secondary">
                  {stats?.totalListings ?? "—"}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100 admin-lf-chart-card">
            <CardBody className="d-flex flex-column">
              <div className="admin-lf-visual-head mb-3">
                <CardTitle tag="h2" className="h6 fw-bold mb-1 text-dark">
                  Lost vs found
                </CardTitle>
                <p className="admin-lf-visual-sub mb-0">
                  Visible listings on public lost &amp; found pages
                </p>
              </div>
              {statsLoading ? (
                <div className="text-center py-5 my-auto">
                  <Spinner color="secondary" />
                </div>
              ) : !stats || chartPercents.total === 0 ? (
                <p className="text-muted small mb-0 mt-auto">
                  No visible listings yet.
                </p>
              ) : (
                <>
                  <div
                    className="admin-lf-donut-layout"
                    role="img"
                    aria-label={`Lost ${stats?.lostVisible ?? 0}, Found ${stats?.foundVisible ?? 0}`}
                  >
                    <div className="admin-lf-donut-visual">
                      <div
                        className="admin-lf-donut-ring"
                        style={{
                          background: `conic-gradient(from -90deg, #f0c85a 0deg, #e0a820 ${
                            (chartPercents.lostPct / 100) * 360
                          }deg, #3ae0b8 ${
                            (chartPercents.lostPct / 100) * 360
                          }deg, #129b76 360deg)`,
                        }}
                      />
                      <div className="admin-lf-donut-center">
                        <span className="admin-lf-donut-total-label">
                          Visible total
                        </span>
                        <span className="admin-lf-donut-total-value">
                          {stats?.listingVisibleCount ?? 0}
                        </span>
                        <span className="admin-lf-donut-total-hint">
                          listings
                        </span>
                      </div>
                    </div>
                    <div className="admin-lf-donut-legend">
                      <div className="admin-lf-leg-row">
                        <span
                          className="admin-lf-leg-swatch admin-lf-leg-swatch--lost"
                          aria-hidden
                        />
                        <div className="admin-lf-leg-text">
                          <span className="admin-lf-leg-name">Lost</span>
                          <span className="admin-lf-leg-meta">
                            {stats?.lostVisible ?? 0} listings ·{" "}
                            {Math.round(chartPercents.lostPct)}%
                          </span>
                        </div>
                      </div>
                      <div className="admin-lf-leg-row">
                        <span
                          className="admin-lf-leg-swatch admin-lf-leg-swatch--found"
                          aria-hidden
                        />
                        <div className="admin-lf-leg-text">
                          <span className="admin-lf-leg-name">Found</span>
                          <span className="admin-lf-leg-meta">
                            {stats?.foundVisible ?? 0} listings ·{" "}
                            {Math.round(chartPercents.foundPct)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <CardTitle tag="h2" className="h6 fw-bold mb-3">
                Latest registrations
              </CardTitle>
              {statsLoading ? (
                <Spinner color="secondary" />
              ) : !stats?.latestUsers?.length ? (
                <p className="text-muted small mb-0">No users yet.</p>
              ) : (
                <ul className="list-unstyled small mb-0">
                  {stats.latestUsers.map((u) => (
                    <li
                      key={String(u._id)}
                      className="border-bottom py-2"
                    >
                      <strong className="text-dark">
                        {u.firstname} {u.lastname}
                      </strong>
                      <span className="d-block text-muted text-truncate">
                        {u.email}
                      </span>
                      <span className="text-success">
                        {u.createdAt
                          ? moment(u.createdAt).format("MMM D, YYYY HH:mm")
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="justify-content-center mb-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <CardTitle tag="h2" className="h5 fw-bold mb-3">
                Listings (lost &amp; found)
              </CardTitle>
              <p className="text-muted small mb-3">
                Search and filter all listings. <strong>Hide</strong> marks a
                listing as <strong>Private</strong> (not on public feeds);{" "}
                <strong>delete</strong> removes it permanently. For{" "}
                <strong>lost</strong>, when the owner uses{" "}
                <strong>Mark as found</strong>, it appears as{" "}
                <strong>Found</strong> here. For <strong>found</strong>, when
                the poster uses <strong>Returned to owner</strong>, it appears
                as <strong>Returned</strong> here. Resolved listings no longer
                appear on the public lost or found pages.
              </p>
              <Row className="g-2 align-items-end mb-3">
                <Col sm={6} md={4}>
                  <FormGroup className="mb-0">
                    <Label for="admin-items-type" className="small">
                      Type
                    </Label>
                    <Input
                      id="admin-items-type"
                      type="select"
                      value={itemsFilter}
                      onChange={(e) => setItemsFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="lost">Lost</option>
                      <option value="found">Found</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col sm={6} md={5}>
                  <FormGroup className="mb-0">
                    <Label for="admin-items-search" className="small">
                      Search
                    </Label>
                    <Input
                      id="admin-items-search"
                      placeholder="Name, location, description…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col sm={12} md={3}>
                  <Button
                    color="outline-secondary"
                    size="sm"
                    className="w-100"
                    type="button"
                    onClick={() => loadItems()}
                    disabled={itemsLoading}
                  >
                    Refresh
                  </Button>
                </Col>
              </Row>
              {itemsError ? (
                <Alert color="danger" className="py-2">
                  {itemsError}
                </Alert>
              ) : null}
              {itemsLoading ? (
                <div className="text-center py-4">
                  <Spinner color="success" />
                </div>
              ) : items.length === 0 ? (
                <p className="text-muted small mb-0">No listings match.</p>
              ) : (
                <div className="table-responsive">
                  <Table hover size="sm" className="mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Type</th>
                        <th>Item</th>
                        <th>When</th>
                        <th>Location</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it) => (
                        <tr key={it._id}>
                          <td>
                            <Badge
                              color={
                                it.listingType === "found"
                                  ? "success"
                                  : "warning"
                              }
                              className={
                                it.listingType === "found"
                                  ? ""
                                  : "text-dark"
                              }
                            >
                              {it.listingType}
                            </Badge>
                          </td>
                          <td className="fw-medium">{it.productName}</td>
                          <td className="text-nowrap small">
                            {it.incidentDate
                              ? moment(it.incidentDate).format("MMM D, YYYY")
                              : "—"}
                            <span className="d-block text-muted">
                              {it.createdAt
                                ? `Posted ${moment(it.createdAt).fromNow()}`
                                : ""}
                            </span>
                          </td>
                          <td className="small">
                            {trunc(it.incidentLocation, 40)}
                          </td>
                          <td className="small text-muted">
                            {trunc(it.description, 56)}
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {it.hidden ? (
                                <Badge color="secondary">Private</Badge>
                              ) : (
                                <Badge
                                  color="light"
                                  className="text-dark border"
                                >
                                  Public
                                </Badge>
                              )}
                              {it.listingType === "lost" ? (
                                it.resolved ? (
                                  <Badge color="info">Found</Badge>
                                ) : (
                                  <Badge
                                    color="light"
                                    className="text-dark border"
                                  >
                                    Still lost
                                  </Badge>
                                )
                              ) : it.listingType === "found" ? (
                                it.resolved ? (
                                  <Badge color="info">Returned</Badge>
                                ) : (
                                  <Badge
                                    color="light"
                                    className="text-dark border"
                                  >
                                    Listed
                                  </Badge>
                                )
                              ) : null}
                            </div>
                          </td>
                          <td className="text-end text-nowrap">
                            <Button
                              color="link"
                              size="sm"
                              className="p-1 me-1"
                              disabled={rowBusyId === it._id}
                              onClick={() =>
                                setListingHidden(it._id, !it.hidden)
                              }
                            >
                              {it.hidden ? "Unhide" : "Hide"}
                            </Button>
                            <Button
                              color="link"
                              size="sm"
                              className="p-1 text-danger"
                              disabled={rowBusyId === it._id}
                              onClick={() => deleteListing(it._id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="justify-content-center g-3 mb-4">
        <Col md={12} lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <CardTitle tag="h2" className="h5 fw-bold mb-3">
                Campus notifications
              </CardTitle>
              <p className="text-muted small mb-4">
                Messages you send here appear in every user&apos;s notification
                bell in the header (same feed for all students and staff).
              </p>
              <form onSubmit={handleSend}>
                <FormGroup>
                  <Label for="admin-notif-title">Title</Label>
                  <Input
                    id="admin-notif-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Short headline"
                    maxLength={120}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="admin-notif-body">Message</Label>
                  <Input
                    id="admin-notif-body"
                    type="textarea"
                    rows={4}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Details for users…"
                    maxLength={500}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="admin-notif-link">Link when opened</Label>
                  <Input
                    id="admin-notif-link"
                    type="select"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  >
                    <option value="/home">Home</option>
                    <option value="/lost">Lost</option>
                    <option value="/found">Found</option>
                    <option value="/add-item?type=lost">Add listing</option>
                    <option value="/about">About</option>
                    <option value="/profile">Profile</option>
                  </Input>
                </FormGroup>
                {error ? <Alert color="danger">{error}</Alert> : null}
                {message ? <Alert color="success">{message}</Alert> : null}
                <Button type="submit" color="success" disabled={sending}>
                  {sending ? (
                    <>
                      <Spinner size="sm" className="me-2" /> Sending…
                    </>
                  ) : (
                    "Send notification"
                  )}
                </Button>
              </form>
            </CardBody>
          </Card>
        </Col>
        <Col md={12} lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <CardTitle tag="h2" className="h6 fw-bold mb-3">
                Recent broadcasts
              </CardTitle>
              {listLoading ? (
                <Spinner color="success" />
              ) : list.length === 0 ? (
                <p className="text-muted small mb-0">No notifications yet.</p>
              ) : (
                <ul className="list-unstyled mb-0 small">
                  {list.map((n) => (
                    <li
                      key={n._id}
                      className="border-bottom py-2 mb-0 text-muted"
                    >
                      <strong className="text-dark">{n.title}</strong>
                      <span className="d-block">{n.body}</span>
                      <span className="text-success">→ {n.link}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Admin;
