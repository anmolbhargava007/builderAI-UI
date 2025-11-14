import React, { useEffect, useState } from 'react'
// import { useLogin } from '../hooks/useAuth'
import {
  Box, Button, FormControl, FormLabel, Input, Typography, InputAdornment, IconButton,
} from '@mui/material';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';
import microsoftlogo from '../../assets/Microsoft_logo.png'
// import OrigamisAIlogo from '../../assets/OrigamisAilogo.svg'
import Signup from '../SignUp/Signup';
import './Login.scss'
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import { HiDotsHorizontal } from "react-icons/hi";
import { BeatLoader } from 'react-spinners';
import { useContext } from 'react';
import { CentralizeContext } from '../../context/ContextProvider';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatePassOpen, setIsUpdatePassOpen] = useState(false);
  const [isMicrosoftSignInLoading, setIsMicrosoftSignInLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginDeniedMessage, setLoginDeniedMessage] = useState("");
  const { setCreditBalance } = useContext(CentralizeContext)
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  // const login = useLogin()
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  useEffect(() => {
    const tokenExpire = localStorage.getItem('tokenExpired');
    if (tokenExpire) {
      showToast("token expired", 'danger')
      localStorage.removeItem('tokenExpired');
    }
  }, [showToast]);

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoginDeniedMessage("");
    if (
      typeof email !== "string" || email.trim() === "" ||
      typeof password !== "string" || password.trim() === ""
    ) {
      showToast("Incorrect email or password", "danger");
      return;
    }
    try {
      setIsLoading(true);
      const payload = {
        email: email.toLowerCase(),
        password: password,
      };
      const res = await authService.customLoginUser(payload);

      const {
        jwt_token, role, email: userEmail, name, Status,
        comp_id, user_id, company_credits, user_credits
      } = res.data;

      // if (Status === 0) {
      //   setLoginDeniedMessage("Login access denied. Please contact your admin.");
      //   showToast("Login access denied. Please contact your admin.", "warning");
      //   return;
      // }
      const roleArray=role.split(",").map((t)=>t.trim())

      // ✅ Store login info in localStorage
      localStorage.setItem("token", jwt_token);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("name", name);
      localStorage.setItem("status", Status);
      localStorage.setItem("comp_id", comp_id);
      localStorage.setItem("logintype", "custom");
      localStorage.setItem("tokenExpired", false);
      localStorage.setItem("user_id", user_id)
      localStorage.setItem("role", roleArray)
      localStorage.setItem("company_credits", company_credits)
      localStorage.setItem("user_credits", user_credits)
      setCreditBalance(user_credits)
      localStorage.setItem('tokenExpired', 'false')
      // ✅ Continue logic for navigation or additional state setting if needed
      navigate("/home");

    } catch (err) {
      console.error("Login Error:", err);
      if (err.response?.status === 422) {
        const detail = err.response?.data?.detail[0]?.msg;
        console.log(detail);

        setEmail("");
        setPassword("");
        showToast(detail, "danger");
      }
      if (err.response?.status === 401) {
        const detail = err.response?.data?.detail;
        console.log(detail);

        setLoginDeniedMessage(detail);
        showToast(detail, "warning");
        setEmail("");
        setPassword("");
      }
    } finally {
      setIsLoading(false);
      //setSigninLoader(false);
    }
  };

  const handleSsoLogin = async () => {
    setIsMicrosoftSignInLoading(true);



    try {
      const accounts = msalInstance.getAllAccounts();

      if (accounts.length > 0) {
        const userAccount = accounts[0];

        const silentRequest = {
          scopes: ["user.read"], // Always define required scopes
          account: userAccount,
        };

        try {
          const response = await msalInstance.acquireTokenSilent(silentRequest);

          localStorage.setItem("msalResponse", JSON.stringify(response));
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("logintype", "sso");
          localStorage.setItem("tokenExpired", false);

          const userInformation = {
            name: userAccount.name || response.account.name,
            email: userAccount.username || response.account.username,
            accessToken: response.accessToken,
            expirationTime: response.expiresOn,
            lastLoggedIn: new Date().toISOString(),
          };

          usercredits(userInformation); // Assuming this handles login flow
        } catch (silentError) {
          console.error("Silent login failed, redirecting:", silentError);
          await msalInstance.loginRedirect({ scopes: ["user.read"] });
        }
      } else {
        await msalInstance.loginRedirect({ scopes: ["user.read"] });
      }
    } catch (error) {
      console.error("SSO Login failed:", error);
    } finally {
      setIsMicrosoftSignInLoading(false);
    }
  };


  return (
    <>
      {isLogin ? (
        <Box className="login-page">
          {/* <Box className="logoOrigamis">
            <img
              src={OrigamisAIlogo}
              alt="Origamis AI Logo"
              style={{ width: "150px", objectFit: "contain", margin: '10px' }}
            />
          </Box> */}

          <Box component="form" onSubmit={handleCustomLogin} className="login-form">
            <Typography variant="h5" fontWeight={600}>
              Welcome to Origamis
            </Typography>

            <FormControl fullWidth required sx={{ mb: 2 }}>
              <Box>
                <FormLabel htmlFor="email" className="label-heading">
                  Email
                </FormLabel>
                <Box sx={{ mt: 0 }}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    name="email"
                    required
                    fullWidth
                    disableUnderline
                    className="custom-input"
                  />
                </Box>
              </Box>
            </FormControl>

            <FormControl fullWidth variant="outlined" required>
              <Box>
                <FormLabel htmlFor="password" className="label-heading">
                  Password
                </FormLabel>
                <Box sx={{ mt: 0 }}>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    disableUnderline
                    className="custom-input"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          edge="end"
                          sx={{
                            paddingRight: '20px',
                            background: 'transparent',
                            '&:hover': { background: 'transparent' },
                            '&:active': { background: 'transparent' },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </Box>
              </Box>
            </FormControl>



            <Typography
              variant="body2"
              sx={{
                mt: 1, mb: 2, fontWeight: 500, cursor: isLoading || isMicrosoftSignInLoading ? "not-allowed" : "pointer",
                color: isLoading || isMicrosoftSignInLoading ? "grey" : "Black"
              }}
              // onClick={handleOpenUpdatePassModal}
              disabled={isLoading || isMicrosoftSignInLoading}
            >
              Forgot Password?
            </Typography>

            <Button type="submit" className="button" fullWidth sx={{ fontWeight: 500, height: "40px" }}
              disabled={isLoading || isMicrosoftSignInLoading}
              onClick={handleCustomLogin}
            >
              {isLoading ? (
                <BeatLoader color="#ffffff" />
              ) : (
                'Sign in'
              )}
            </Button>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                height: "40px",
              }}
            >
              <hr className="custom-hr" />
              <Typography variant="body2">OR</Typography>
              <hr className="custom-hr" />
            </Box>



            <Button className="MicrosoftButton" fullWidth
              disabled={isLoading || isMicrosoftSignInLoading}
              onClick={handleSsoLogin}
            >
              <img
                src={microsoftlogo}
                alt="Microsoft Logo"
                className="ms-logo"
              />
              <Typography
                component="span"
                sx={{
                  color: isLoading || isMicrosoftSignInLoading ? "grey" : "white",
                  fontSize: "14px",
                }}
              >
                {isMicrosoftSignInLoading ? (
                  <BeatLoader color="#ffffff" />
                ) : (
                  'Sign in with Microsoft'
                )}
              </Typography>
            </Button>

            <Box mt={1}>
              <Typography variant="body2">
                Don't have an account?{" "}
                {isLoading || isMicrosoftSignInLoading ? (
                  <Typography
                    component="span"
                    color="primary"
                    sx={{
                      fontWeight: 600, cursor: isLoading || isMicrosoftSignInLoading ? "not-allowed" : "pointer",
                      color: isLoading || isMicrosoftSignInLoading ? "grey" : "rgba(255, 0, 135, 1)",
                      fontSize: "16px"
                    }}
                    disabled={isLoading || isMicrosoftSignInLoading}
                  >
                    Sign Up
                  </Typography>
                ) : (<Typography
                  component="span"
                  color="primary"
                  onClick={() => setIsLogin(false)}
                  sx={{ fontWeight: 600, cursor: "pointer", color: "rgba(255, 0, 135, 1)", fontSize: "16px" }}
                >
                  Sign Up
                </Typography>)
                }
              </Typography>
            </Box>

            <Box mt={1}>
              <Typography variant="body2">
                Login issues?{" "}
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 400, fontSize: "14px",
                    cursor: isLoading || isMicrosoftSignInLoading ? "not-allowed" : "pointer",
                    color: isLoading || isMicrosoftSignInLoading ? "grey" : "rgba(255, 0, 135, 1)"
                  }}
                >
                  Contact Support
                </Typography>
              </Typography>
            </Box>

          </Box>
        </Box>
      ) : (
        <Signup setIsLogin={setIsLogin} />
      )}
    </>
  )
}

export default Login
