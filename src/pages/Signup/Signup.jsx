import React, { useState, useEffect } from 'react';
import {
	Box,
	Button,
	IconButton,
	InputAdornment,
	MenuItem,
	Select,
	TextField,
	Typography,
	FormControl,
	FormLabel,
	Input,
	InputLabel,
	OutlinedInput
} from '@mui/material';
import './Signup.scss';
import { useToast } from '../../context/ToastContext';
import { Visibility, VisibilityOff } from '@mui/icons-material';
// import OrigamisAILogo from '../../assets/OrigamisAILogo.png';
import companyService from '../../services/companyService';
import { BeatLoader } from 'react-spinners';

const Signup = ({ setIsLogin }) => {
	const [orgName, setOrgName] = useState('');
	const [fullName, setFullName] = useState('');
	const [orgEmail, setOrgEmail] = useState('');
	const [phonenumber, setPhoneNumber] = useState('');
	const [countrycode, setCountryCode] = useState('91');
	// const [mobile, setMobile] = useState('');
	// const [errorMessage, setErrorMessage] = useState("");
	const [createPassword, setCreatePassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	// const [countryCode, setCountryCode] = useState('91');
	// const [isLoading, setIsLoading] = useState(false);
	const handleClickShowPassword = () => setShowPassword((prev) => !prev);
	const { showToast } = useToast();
	const [isSignup, setIssignup] = useState(false);

	const handleRegister = async (e) => {
		console.log("Form submit triggered");
		e.preventDefault();
		// setErrorMessage("");
		if (
			!orgName ||
			!fullName ||
			!orgEmail ||
			!createPassword ||
			!confirmPassword ||
			!countrycode ||
			!phonenumber
		) {
			showToast("Please fill in all the fields", "danger");	
			return;
		}
		const createError = createPassword.length > 0 && createPassword.length < 6;
		// const confirmError = confirmPassword.length > 0 && (confirmPassword.length < 6);
		
		if (createPassword !== confirmPassword) {
			showToast("Passwords do not match", "warning");
			return;
		}
		if (createError) {
			showToast("Password must be at least 6 characters long.");
			return;
		}

		// if (confirmError) {
		// 	showToast("Passwords must match and be at least 6 characters long.");
		// 	return;
		// }

		const payload = {
			ownername: fullName,
			compname: orgName,
			compemail: orgEmail.toLowerCase(),
			phonenumber: phonenumber,
			countrycode: countrycode,
			password: createPassword,
			// status: 1, // Default value set to -1
		};

		console.log("payload", payload);
		// setIsLoading(true);

		try {
			setIssignup(true);
			const res = await companyService.company_register(payload);
			if (res.data?.message) {
				showToast("You've completed the registration. Check your email to verify your account.", "success");
			}
		} catch (err) {
			console.error("Company Registration failed:", err);
			const detail = err.response?.data?.detail || "An error occurred during registration.";
			showToast(detail, "danger");
		} finally {
			// setIsLoading(false);
			setIssignup(false);
			handleClearForm(); // reset the form
		}
	};

	const handleClearForm = () => {
		setOrgName("");
		setFullName("");
		setOrgEmail("");
		setCreatePassword("");
		setConfirmPassword("");
		// setMobile("");
		setPhoneNumber("");
		// setCountryCode("(+91)");
	};

	const countries = [
		{ code: "91", label: "India" },
		{ code: "1", label: "USA" }
	];

	return (
		<Box className="signup-page">
			{/* <Box sx={{ position: "absolute", top: "5%", left: "5%" }}>
				<img src={OrigamisAILogo} alt="Origamis AI Logo" style={{ width: "150px", objectFit: "contain" }} />
			</Box> */}
			<Box
				component="form" onSubmit={handleRegister} className='signup-form'>
				<h1 style={{ fontWeight: 600, fontSize: '20px' }}> It takes a jiffy to Sign Up!</h1>
				<FormControl fullWidth variant="outlined" required >
					<Box mb={0.5}>
						<FormLabel htmlFor="Organization Name" className="label-heading" sx={{ fontWeight: 500 }}>Organization Name</FormLabel>
						<Box sx={{ mt: 0 }}>
							<Input id="orgName" type="text" className="input-field" placeholder="Enter Organization Name"
								value={orgName} onChange={(e) => setOrgName(e.target.value)} required fullWidth disableUnderline
							/>
						</Box>
					</Box>
				</FormControl>
				<FormControl fullWidth variant="outlined" required >
					<Box mb={0.5}>
						<FormLabel htmlFor="Full Name" className="label-heading" sx={{ fontWeight: 500 }}>Full Name</FormLabel>
						<Box sx={{ mt: 0 }}>
							<Input id="fullName" type="text" className="input-field" placeholder="Enter Full Name..." value={fullName}
								onChange={(e) => setFullName(e.target.value)} required fullWidth disableUnderline />
						</Box>
					</Box>
				</FormControl>
				<FormControl fullWidth variant="outlined" required >
					<Box mb={1}>
						<FormLabel htmlFor="Organization Email" className="label-heading" sx={{ fontWeight: 500 }}>Work Email</FormLabel>
						<Box sx={{ mt: 0 }}>
							<Input id="orgEmail" type="email" className="input-field" placeholder="Enter your work email..." value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} required fullWidth disableUnderline
							/>
						</Box>
					</Box>
				</FormControl>
				<FormControl fullWidth variant="outlined" required >
					<Box mb={0.5}>
						<FormLabel className="label-heading" sx={{ fontWeight: 500 }}>Mobile</FormLabel>
						<div style={{ display: 'flex', gap: '10px' }}>
							<Select id="countrycode"
								sx={{ mt: 0, width: '25%', height: "35px", borderRadius: "8px", backgroundColor: "white" }}
								type="number"
								className="input-field country-code-select"
								placeholder="Enter your country code ..."
								value={countrycode} onChange={(e) => setCountryCode(e.target.value)}
								required fullWidth disableUnderline
							>
								{countries.map((c) => (
									<MenuItem key={c.code} value={c.code}>
										(+{c.code}) {c.label}
									</MenuItem>
								))}
							</Select>
							<FormControl fullWidth variant="outlined" required >
								<Box sx={{ mt: 0, width: 'auto' }}>
									<Input id="phonenumber" type="number" className="input-field" placeholder="Enter your Phone Number..." value={phonenumber} onChange={(e) => setPhoneNumber(e.target.value)} required fullWidth disableUnderline
									/>
								</Box>
							</FormControl>
						</div>
					</Box>
				</FormControl>
				{/* <FormControl fullWidth variant="outlined" required >
					<Box >
						<FormLabel htmlFor="Phone Number" className="label-heading" sx={{ fontWeight: 500 }}>Phone Number</FormLabel>
					</Box>
				</FormControl> */}
				<FormControl fullWidth variant="outlined" required >
					<Box mb={0.5}>
						<FormLabel htmlFor="Create Password" className="label-heading" sx={{ fontWeight: 500 }}>Create Password</FormLabel>
						<Box sx={{ mt: 0 }}>
							<Input id="createPassword" type="password" className="input-field" placeholder="Enter your password..." value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} required fullWidth disableUnderline
							/>
						</Box>
					</Box>
				</FormControl>
				<FormControl fullWidth variant="outlined" required sx={{ mb: 2 }}>
					<Box mb={0.5}>
						<FormLabel htmlFor="confirmPassword" className="label-heading" sx={{ fontWeight: 500 }}>
							Confirm Password
						</FormLabel>
						<Box sx={{ mt: 0 }}>
							<Input
								id="confirmPassword"
								type={showPassword ? 'text' : 'password'}
								className="input-field"
								placeholder="Re-enter your password..."
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								fullWidth
								disableUnderline
								endAdornment={
									<InputAdornment position="end">
										<IconButton
											onClick={handleClickShowPassword}
											edge="end"
											sx={{ paddingRight: '20px' }}
										>
											{showPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								}
							/>
						</Box>
					</Box>
				</FormControl>


				{/* <FormControl fullWidth required sx={{ mb: 2 }}>
					<Box >
						<FormLabel htmlFor="Mobile" className="heading8"  sx={{ fontWeight: 500 }}>PHONE NUMBER</FormLabel>
						<Box sx={{ mt: 0 }}>
							<Input id="mobile" type="number" className="login-input-field" placeholder="Enter your phone number..." value= {mobile} onChange={(e) => setMobile(e.target.value)}  required fullWidth disableUnderline 
							/>
						</Box>
					</Box>
				</FormControl> */}

				<Button type='submit' className="button" fullWidth sx={{ fontWeight: "500", height: "40px" }}
					disabled={isSignup}>
					{isSignup ? (
						<BeatLoader color="#ffffff"/>
					) : (
						'Sign Up'
					)}
				</Button>

				<Box mt={1}>
					<Typography variant="body2">
						By clicking on the button above, you agree with our{" "}
						<Typography
							component="span"
							sx={{ fontWeight: 400, color: "rgba(255, 0, 135, 1)", cursor: "pointer", fontSize: "14px", marginRight: "10px" }}
						>
							Terms & Conditions
						</Typography>
						and
						<Typography
							component="span"
							sx={{ fontWeight: 400, color: "rgba(255, 0, 135, 1)", cursor: "pointer", fontSize: "14px", marginLeft: "10px" }}
						>
							Privacy Policy
						</Typography>
					</Typography>
				</Box>

				<Box mt={1}>
					<Typography variant="body2">
						Not for the first time here?
						{isSignup ? (
							<Typography
								component="span"
								sx={{
									fontWeight: 600, fontSize: "15px", marginRight: "10px",
									cursor: isSignup ? "not-allowed" : "pointer",
									color: isSignup ? "grey" : "rgba(255, 0, 135, 1)",
								}}
								disabled={isSignup}
							>Sign In</Typography>
						) : (
							<Typography
								component="span"
								sx={{
									fontWeight: 600, fontSize: "15px", marginRight: "10px",
									cursor: "pointer", color: "rgba(255, 0, 135, 1)"
								}}
								onClick={() => setIsLogin(true)}
							>
								Sign In
							</Typography>
						)}
					</Typography>
				</Box>
			</Box>
		</Box>
	)
}

export default Signup