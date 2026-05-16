import { Button, Col, Container, FormGroup, Row } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/smart-campus-logo.png";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ForgotPasswordValidation } from "../validations/ForgotPasswordValidation";
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordByEmail, clearMessage } from "../features/UserSlice";
import { useEffect } from "react";

const ForgetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const message = useSelector((s) => s.user.message);
  const isLoading = useSelector((s) => s.user.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ForgotPasswordValidation),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  useEffect(() => {
    if (message === "Password reset successfully") {
      const t = setTimeout(() => {
        dispatch(clearMessage());
        navigate("/", { replace: true });
      }, 1600);
      return () => clearTimeout(t);
    }
  }, [message, navigate, dispatch]);

  const onSubmit = (data) => {
    dispatch(
      resetPasswordByEmail({
        email: data.email.trim(),
        newPassword: data.password,
      })
    );
  };

  return (
    <Container className="auth-page">
      <Row className="justify-content-center align-items-center min-vh-100 py-4">
        <Col xs={11} sm={10} md={8} lg={5}>
          <form
            className="auth-card"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <img
              src={logo}
              alt="smart campus logo"
              width="170"
              className="img-fluid d-block mx-auto mb-3"
            />

            <h3 className="text-center fw-bold mb-1">Forgot Password</h3>
            <p className="text-center text-muted mb-4 small">
              Enter your registered email and a new password. No email is sent —
              your password updates immediately for this demo.
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
                  autoComplete="email"
                  {...register("email")}
                />
              </div>
              <p className="text-danger small mb-0">{errors.email?.message}</p>
            </FormGroup>

            <FormGroup>
              <div className="input-group">
                <span className="input-group-text">
                  <RiLockPasswordLine />
                </span>
                <input
                  type="password"
                  placeholder="New password..."
                  className="form-control"
                  autoComplete="new-password"
                  {...register("password")}
                />
              </div>
              <p className="text-danger small mb-0">{errors.password?.message}</p>
            </FormGroup>

            <FormGroup>
              <div className="input-group">
                <span className="input-group-text">
                  <RiLockPasswordLine />
                </span>
                <input
                  type="password"
                  placeholder="Confirm new password..."
                  className="form-control"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
              </div>
              <p className="text-danger small mb-0">
                {errors.confirmPassword?.message}
              </p>
            </FormGroup>

            {message === "Password reset successfully" && (
              <p className="text-success text-center small mb-2">
                Password updated. Redirecting to login…
              </p>
            )}
            {message &&
              message !== "Password reset successfully" &&
              message !== "" && (
                <p className="text-danger text-center small mb-2">{message}</p>
              )}

            <Button
              type="submit"
              className="w-100 auth-btn-primary mb-3"
              disabled={isLoading}
            >
              {isLoading ? "Saving…" : "Reset password"}
            </Button>

            <p className="text-center mb-0 small-text">
              Remembered your password?{" "}
              <Link to="/" className="auth-link fw-bold text-decoration-none">
                Back to login
              </Link>
            </p>
          </form>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgetPassword;
