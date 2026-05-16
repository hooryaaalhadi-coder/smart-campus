import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../api/api";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardSubtitle,
  CardText,
  CardTitle,
  Col,
  Container,
  Row,
  Spinner,
  UncontrolledCarousel,
} from "reactstrap";
import { MdOutlineTravelExplore, MdPhotoCamera, MdPlace } from "react-icons/md";

const HERO_PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="480" viewBox="0 0 1200 480">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#16a184"/><stop offset="100%" stop-color="#3d7a6f"/>
      </linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="44%" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="34" font-weight="700">Smart Campus</text>
      <text x="50%" y="58%" text-anchor="middle" fill="#e8fff8" font-family="system-ui,sans-serif" font-size="17">Share a photo &amp; location — help someone today</text>
    </svg>`
  );

function trunc(s, max) {
  const t = String(s || "").trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

const Home = () => {
  const user = useSelector((s) => s.user.user);
  const first = String(user?.firstname || "").trim();
  const [lost, setLost] = useState([]);
  const [found, setFound] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    async function load() {
      setFetchError("");
      setLoading(true);
      try {
        const [lostRes, foundRes] = await Promise.all([
          API.get("/items", {
            params: { type: "lost" },
            signal,
          }),
          API.get("/items", {
            params: { type: "found" },
            signal,
          }),
        ]);
        setLost(Array.isArray(lostRes.data) ? lostRes.data : []);
        setFound(Array.isArray(foundRes.data) ? foundRes.data : []);
      } catch (e) {
        if (signal.aborted || e?.code === "ERR_CANCELED") return;
        setFetchError("Could not load live listings. Check that the server is running.");
        setLost([]);
        setFound([]);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  const carouselItems = useMemo(() => {
    const merged = [
      ...lost.map((item) => ({ ...item, _homeType: "lost" })),
      ...found.map((item) => ({ ...item, _homeType: "found" })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
    const pick = merged.slice(0, 6);
    if (pick.length === 0) {
      return [
        {
          key: "slide-welcome",
          src: HERO_PLACEHOLDER,
          altText: "Welcome",
          header: "Lost & found, in one place",
          caption:
            "Browse what others posted or add your own listing with a photo and map pin.",
        },
        {
          key: "slide-fast",
          src: HERO_PLACEHOLDER,
          altText: "Fast",
          header: "Built for campus life",
          caption:
            "Omani mobile (8 digits starting with 7 or 9), incident date, and optional GPS — structured so matches are easier.",
        },
      ];
    }
    return pick.map((item) => ({
      key: String(item._id),
      src: item.image || HERO_PLACEHOLDER,
      altText: item.productName || "Listing",
      header: `${item._homeType === "lost" ? "Lost" : "Found"} · ${
        item.productName || "Item"
      }`,
      caption: trunc(item.description, 110),
    }));
  }, [lost, found]);

  const lostCount = lost.length;
  const foundCount = found.length;

  return (
    <div className="home-page">
      <Container className="home-page-inner py-4 py-md-5 px-3">
        {fetchError ? (
          <Alert color="warning" className="home-alert shadow-sm">
            {fetchError}
          </Alert>
        ) : null}

        <Row className="justify-content-center mb-4 g-4">
          <Col lg={10} xl={9}>
            <Card className="border-0 shadow-lg text-white home-hero-card overflow-hidden">
              <CardBody className="p-4 p-md-5 text-center">
                <Badge
                  color="light"
                  pill
                  className="mb-3 px-3 py-2 text-success fw-semibold text-uppercase small"
                >
                  Live campus board
                </Badge>
                <CardTitle tag="h1" className="home-hero-title fw-bold mb-3">
                  {first ? `Welcome back, ${first}!` : "Welcome to Smart Campus"}
                </CardTitle>
                <CardSubtitle className="text-white-50 home-hero-sub mb-0">
                  Spot lost gear, return found property, and keep the community
                  moving — all in one friendly hub.
                </CardSubtitle>
                <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
                  <Button
                    tag={Link}
                    to="/lost"
                    color="light"
                    className="fw-semibold text-success px-4"
                  >
                    Explore lost
                  </Button>
                  <Button
                    tag={Link}
                    to="/found"
                    outline
                    color="light"
                    className="fw-semibold px-4"
                  >
                    See found
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mb-4 justify-content-center">
          <Col sm={6} lg={4}>
            <Card className="h-100 border-0 shadow-sm home-stat-card text-center">
              <CardBody>
                <CardTitle tag="h3" className="home-stat-value mb-0">
                  {loading ? <Spinner size="sm" color="success" /> : lostCount}
                </CardTitle>
                <CardText className="text-muted small text-uppercase fw-semibold mb-0 mt-2">
                  Lost posts
                </CardText>
              </CardBody>
            </Card>
          </Col>
          <Col sm={6} lg={4}>
            <Card className="h-100 border-0 shadow-sm home-stat-card text-center">
              <CardBody>
                <CardTitle tag="h3" className="home-stat-value mb-0">
                  {loading ? <Spinner size="sm" color="success" /> : foundCount}
                </CardTitle>
                <CardText className="text-muted small text-uppercase fw-semibold mb-0 mt-2">
                  Found posts
                </CardText>
              </CardBody>
            </Card>
          </Col>
          <Col sm={12} lg={4}>
            <Card className="h-100 border-0 shadow-sm home-stat-card text-center">
              <CardBody>
                <CardTitle tag="h3" className="home-stat-value mb-0">
                  {loading ? (
                    <Spinner size="sm" color="success" />
                  ) : (
                    lostCount + foundCount
                  )}
                </CardTitle>
                <CardText className="text-muted small text-uppercase fw-semibold mb-0 mt-2">
                  Total active listings
                </CardText>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="justify-content-center mb-4">
          <Col lg={10} xl={9}>
            <Card className="border-0 shadow home-carousel-card overflow-hidden">
              <CardBody className="pb-0">
                <div className="mb-3">
                  <Badge color="success" pill className="me-2">
                    Spotlight
                  </Badge>
                  <CardTitle tag="h2" className="d-inline fs-5 fw-bold mb-0">
                    Fresh from campus
                  </CardTitle>
                </div>
              </CardBody>
              <div className="home-carousel">
                <UncontrolledCarousel
                  items={carouselItems}
                  indicators
                  controls
                  dark
                  autoPlay={!reduceMotion}
                  interval={5000}
                />
              </div>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm home-feature-card">
              <CardBody>
                <div className="home-feature-icon mb-3 text-success">
                  <MdOutlineTravelExplore size={36} />
                </div>
                <CardTitle tag="h3" className="fs-5 fw-bold">
                  Search-friendly
                </CardTitle>
                <CardText className="text-muted small mb-0">
                  Lost and found feeds stay tidy with dates, locations, and
                  optional map links so you can act fast.
                </CardText>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm home-feature-card">
              <CardBody>
                <div className="home-feature-icon mb-3 text-success">
                  <MdPhotoCamera size={36} />
                </div>
                <CardTitle tag="h3" className="fs-5 fw-bold">
                  Picture the item
                </CardTitle>
                <CardText className="text-muted small mb-0">
                  Upload a clear photo with your listing — it appears in the
                  spotlight carousel for everyone visiting home.
                </CardText>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm home-feature-card">
              <CardBody>
                <div className="home-feature-icon mb-3 text-success">
                  <MdPlace size={36} />
                </div>
                <CardTitle tag="h3" className="fs-5 fw-bold">
                  Pin the scene
                </CardTitle>
                <CardText className="text-muted small mb-0">
                  Capture GPS when you post so classmates can open the exact spot
                  in maps with one tap.
                </CardText>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
