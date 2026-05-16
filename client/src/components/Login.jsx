import { Button, Col, Container, FormGroup, Row } from "reactstrap";
import logo from "../assets/smart-campus-logo.png";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { LoginValidation } from "../validations/LoginValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, clearMessage } from "../features/UserSlice";
import { useDispatch, useSelector } from "react-redux";

const Login = () => {
  const dispatch = useDispatch();
  const message = useSelector((state) => state.user.message);
  const isSuccess = useSelector((state) => state.user.isSuccess);
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit: submitForm,
    formState: { errors },
  } = useForm({ resolver: yupResolver(LoginValidation) });

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  useEffect(() => {
    if (user && (user._id || user.email)) {
      navigate(user.isAdmin ? "/admin" : "/home", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = (data) => {
    dispatch(login({ email: data.email, password: data.password }));
  };

  useEffect(() => {
    if (message === "success" && isSuccess && user && (user._id || user.email)) {
      if (user.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    }
  }, [message, isSuccess, user, navigate]);
  return (
    <Container className="auth-page">
      <Row className="justify-content-center align-items-center min-vh-100 py-4">
        <Col xs={11} sm={10} md={8} lg={5}>
          <form className="auth-card">
            <div>
              <img
                src={logo}
                alt="logo"
                width="180"
                className="img-fluid d-block mx-auto mb-3"
              />
            </div>
            <h3 className="text-center fw-bold mb-1">Welcome Back</h3>
            <p className="text-center text-muted mb-4">
              Login to access your smart campus account.
            </p>
            <FormGroup>
              <div className="input-group">
                <span className="input-group-text">
                  <MdOutlineMailOutline />
                </span>
                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="form-control text-success"
                  {...register("email")}
                />
              </div>
              <p className="text-danger">{errors.email?.message}</p>
            </FormGroup>
            <FormGroup>
              <div className="input-group">
                <span className="input-group-text">
                  <RiLockPasswordLine />
                </span>
                <input
                  type="password"
                  placeholder="Enter your password..."
                  className="form-control"
                  {...register("password")}
                />
              </div>
              <p className="text-danger">{errors.password?.message}</p>
            </FormGroup>
            <div className="text-center mb-2">
              <Link
                to="/forgetPassword"
                className="text-decoration-none auth-link"
              >
                Forgot password?
              </Link>
            </div>
            <div className="text-center">
              <p className="small-text">
                Don't have an account?{" "}
                <Link
                  to="/registration"
                  className="text-decoration-none fw-bold auth-link"
                >
                  Register
                </Link>
              </p>
              {message && message !== "success" && (
                <p className="text-danger small mb-2">{message}</p>
              )}
              <Button
                className="w-100 auth-btn-primary"
                onClick={submitForm(handleSubmit)}
              >
                Login
              </Button>
            </div>
          </form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
