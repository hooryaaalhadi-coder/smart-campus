const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer text-center py-3">
      <div className="container">
        <p className="mb-0 small text-muted">
          Smart Campus — connected campus services. © {year}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
