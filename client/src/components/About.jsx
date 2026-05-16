import { Col, Container, Row } from "reactstrap";
import {
  MdMap,
  MdPhotoCamera,
  MdSearch,
  MdVolunteerActivism,
} from "react-icons/md";

const MAPS_QUERY =
  "https://www.google.com/maps/search/?api=1&query=Higher+College+of+Technology+Muscat+Lab+N222";

const About = () => {
  return (
    <div className="about-page">
      <Container className="py-4 py-md-5 about-page-inner px-3">
        <Row className="justify-content-center g-4">
          <Col xs={12} lg={10} xl={9} className="about-page-content">
            <header className="about-hero-card mx-auto text-center">
              <span className="about-hero-badge">Smart Campus</span>
              <h1 className="about-hero-title">About us</h1>
              <p className="about-hero-lead mb-0">
                The Missing Product System is a web platform for our campus
                community: post what you lost or found, add a photo and location
                when it helps, and reach the right person faster.
              </p>
            </header>

            <section className="about-section" aria-labelledby="about-values-heading">
              <h2 id="about-values-heading" className="about-section-title">
                What you can do here
              </h2>
              <Row className="g-3 g-md-4 about-values-row">
                <Col sm={6} lg={4}>
                  <div className="about-value-card h-100">
                    <div className="about-value-icon" aria-hidden>
                      <MdPhotoCamera size={28} />
                    </div>
                    <h3 className="about-value-title">Rich listings</h3>
                    <p className="about-value-text mb-0">
                      Describe the item, attach a clear photo, and pin where it
                      was last seen so others recognize it quickly.
                    </p>
                  </div>
                </Col>
                <Col sm={6} lg={4}>
                  <div className="about-value-card h-100">
                    <div className="about-value-icon" aria-hidden>
                      <MdSearch size={28} />
                    </div>
                    <h3 className="about-value-title">Lost board</h3>
                    <p className="about-value-text mb-0">
                      Scan recent lost posts from classmates and staff — sorted
                      with dates and places to spot possible matches.
                    </p>
                  </div>
                </Col>
                <Col sm={12} lg={4}>
                  <div className="about-value-card h-100">
                    <div className="about-value-icon" aria-hidden>
                      <MdVolunteerActivism size={28} />
                    </div>
                    <h3 className="about-value-title">Found feed</h3>
                    <p className="about-value-text mb-0">
                      Share items you picked up safely so owners can claim them
                      and close the loop on happy reunions.
                    </p>
                  </div>
                </Col>
              </Row>
            </section>

            <section className="about-find-section text-center">
              <h2 className="about-find-heading fw-bold mb-2">
                Where can you find us?
              </h2>
              <p className="about-find-blurb mb-3">
                The Smart Campus Lost &amp; Found center is in the{" "}
                <strong>new building</strong>, <strong>Lab N222</strong>, at the
                Higher College of Technology, Muscat — open the map for
                directions to campus.
              </p>
              <a
                href={MAPS_QUERY}
                target="_blank"
                rel="noopener noreferrer"
                className="btn about-location-btn d-inline-flex align-items-center gap-2"
              >
                <MdMap size={22} aria-hidden />
                Open in Google Maps
              </a>
            </section>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default About;
