"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModeToggle } from "@/components/ui/mode-toggle"
import type { UserRole } from "@/app/page"
import { useEffect, useState } from "react"
import { API_BASE } from "@/lib/constants"
import { fetchWithApi, getAccessToken, setAccessToken } from "@/lib/fetchWithToken"
import { setUserId } from "@/lib/globals"

interface LoginScreenProps {
  onLogin: (role: UserRole) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isRegisterPane, setRegisterPaneOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    user_id: '',
    display_name: '',
    email: '',
    role: '' as UserRole | ''
  });
  const [formErrors, setFormErrors] = useState({
    user_id: '',
    display_name: '',
    email: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const validateForm = () => {
    const errors = { user_id: '', display_name: '', email: '', role: '' };
    let isValid = true;

    // Validate user_id (numeric and not empty)
    if (!formData.user_id.trim()) {
      errors.user_id = 'User ID is required';
      isValid = false;
    } else if (!/^\d+$/.test(formData.user_id.trim())) {
      errors.user_id = 'User ID must be numeric';
      isValid = false;
    }

    // Validate display_name (not empty)
    if (!formData.display_name.trim()) {
      errors.display_name = 'Display Name is required';
      isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate role selection
    if (!formData.role) {
      errors.role = 'Please select a role';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role }));
    if (formErrors.role) {
      setFormErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const handleStudentSelect = () => handleRoleSelect("student");
  const handleTutorSelect = () => handleRoleSelect("tutor");

  const [loginUrl, setLoginUrl] = useState<string>("");
  const [redirectUri, setRedirectUri] = useState<string>("");

  const onLoginClick = () => {
    if (loginUrl) {
      document.location = loginUrl;
    }
  };

  const onRegisterClick = () => {
    setRegisterPaneOpen(true);
  };

  const onRegisterSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: formData.user_id.trim(),
          display_name: formData.display_name.trim(),
          email: formData.email.trim(),
          role: formData.role
        })
      });

      if (response.ok) {
        // Success - show confirmation modal
        setShowSuccessModal(true);
      } else if (response.status === 422) {
        // Handle validation errors
        const errorData = await response.json();
        if (errorData.detail) {
          // Handle FastAPI validation errors
          const apiErrors = { user_id: '', display_name: '', email: '', role: '' };
          if (Array.isArray(errorData.detail)) {
            errorData.detail.forEach((error: any) => {
              if (error.loc && error.loc.length > 1) {
                const field = error.loc[1];
                if (field in apiErrors) {
                  apiErrors[field as keyof typeof apiErrors] = error.msg;
                }
              }
            });
          }
          setFormErrors(apiErrors);
        }
      } else {
        // Generic error handling
        setFormErrors(prev => ({ ...prev, role: 'Registration failed. Please try again.' }));
      }
    } catch (error) {
      console.error('Registration error:', error);
      setFormErrors(prev => ({ ...prev, role: 'Network error. Please check your connection and try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const onBackToSignIn = () => {
    setRegisterPaneOpen(false);
    setFormData({ user_id: '', display_name: '', email: '', role: '' });
    setFormErrors({ user_id: '', display_name: '', email: '', role: '' });
  };

  const onSuccessModalClose = () => {
    setShowSuccessModal(false);
    setRegisterPaneOpen(false);
    setFormData({ user_id: '', display_name: '', email: '', role: '' });
    setFormErrors({ user_id: '', display_name: '', email: '', role: '' });
  };

  async function getToken(code: string) {
    try {
      if (!redirectUri) {
        return;
      }

      const response = await fetch(API_BASE + "/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, "redirect_uri": redirectUri })
      });

      const json = await response.json();

      if (response.ok) {
        console.log("JWT:", json);
        setAccessToken(json.access_token);
        setUserId(json.user_id);

        onLogin(json.role);
      }
      else {
        //document.location = loginUrl;
      }
    }
    catch (error) {
      console.error("Fetch error:", error);
    }
  }

  async function verifyToken() {
    try
    {
      const response = await fetchWithApi(API_BASE + "/api/auth/me");

      if (response.ok) {
        const json = await response.json();
        setUserId(json.user_id);
        onLogin(json.role);
      }
      else {
        setAccessToken("");
      }
    }
    catch (error)
    {
      setAccessToken("");
    }
  }

  useEffect(() => {
    // Get the current authority (host + optional port)
    const authority = window.location.host; // e.g. "localhost:8000"

    // Construct the redirect_uri using current protocol + authority
    const currentRedirectUri = `${window.location.protocol}//${authority}`;
    setRedirectUri(currentRedirectUri);

    // URL-encode redirect_uri
    const encodedRedirectUri = encodeURIComponent(currentRedirectUri);

    // Build the login URL with the dynamic redirect_uri
    const currentLoginUrl = `https://us-west-2ttuysti65.auth.us-west-2.amazoncognito.com/login?client_id=5duv42nb7jfvuq0kuctin87irc&response_type=code&scope=email+openid+profile&redirect_uri=${encodedRedirectUri}`;
    setLoginUrl(currentLoginUrl);

    setIsInitialized(true);
  }, []); // Empty dependency array = run only once

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const accessToken = getAccessToken();

    if (accessToken != null && accessToken != "") {
      verifyToken();
    }
    else if (code != null) {
      console.log("code: " + code + ", getAccessToken: " + accessToken);
      getToken(code);
    }
  }, [redirectUri]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-end mb-4">
            <ModeToggle />
          </div>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-[#8B1538] dark:bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">O&L</span>
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#8B1538] dark:text-primary">Owl & Lion Access</h1>
              <p className="text-sm text-muted-foreground">Foothill & De Anza Colleges</p>
            </div>
          </div>
          <p className="text-muted-foreground font-serif">Disability-Focused Student-Tutor Platform</p>
        </div>

        {/* Login Form */}
        <Card className="border-2 border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-serif text-[#8B1538] dark:text-primary">{isRegisterPane ? "Create an account" : "Sign in or register"}</CardTitle>
            <CardDescription className="font-serif"></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isRegisterPane && (
            <div className="space-y-3 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={onLoginClick}
                  variant="outline"
                  className="h-12 font-serif border-2 border-[#8B1538] dark:border-primary text-[#8B1538] dark:text-primary hover:bg-[#8B1538] dark:hover:bg-primary hover:text-white transition-colors"
                  disabled={!isInitialized}
                >
                  {!isInitialized ? 'Loading...' : 'Sign in'}
                </Button>
                <Button
                  onClick={onRegisterClick}
                  variant="outline"
                  className="h-12 font-serif border-2 border-[#8B1538] dark:border-primary text-[#8B1538] dark:text-primary hover:bg-[#8B1538] dark:hover:bg-primary hover:text-white transition-colors"
                >
                  Register
                </Button>
              </div>
            </div>
            )}

            {/* Role Selection */}

            {isRegisterPane && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user_id" className="font-serif">
                  User ID
                </Label>
                <Input
                  id="user_id"
                  type="text"
                  placeholder="25499943"
                  className="font-serif"
                  value={formData.user_id}
                  onChange={(e) => handleInputChange('user_id', e.target.value)}
                  disabled={isLoading}
                />
                {formErrors.user_id && (
                  <p className="text-sm text-red-600 dark:text-red-400 font-serif mt-1">{formErrors.user_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name" className="font-serif">
                  Display Name
                </Label>
                <Input
                  id="display_name"
                  type="text"
                  placeholder="Your name"
                  className="font-serif"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  disabled={isLoading}
                />
                {formErrors.display_name && (
                  <p className="text-sm text-red-600 dark:text-red-400 font-serif mt-1">{formErrors.display_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-serif">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="font-serif"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isLoading}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400 font-serif mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <Label className="font-serif text-sm font-medium">I am a:</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleStudentSelect}
                    variant={formData.role === "student" ? "default" : "outline"}
                    className={`h-12 font-serif border-2 transition-colors ${
                      formData.role === "student"
                        ? "bg-[#8B1538] dark:bg-primary text-white border-[#8B1538] dark:border-primary"
                        : "border-[#8B1538] dark:border-primary text-[#8B1538] dark:text-primary hover:bg-[#8B1538] dark:hover:bg-primary hover:text-white"
                    }`}
                    disabled={isLoading}
                  >
                    Student
                  </Button>
                  <Button
                    onClick={handleTutorSelect}
                    variant={formData.role === "tutor" ? "default" : "outline"}
                    className={`h-12 font-serif border-2 transition-colors ${
                      formData.role === "tutor"
                        ? "bg-[#8B1538] dark:bg-primary text-white border-[#8B1538] dark:border-primary"
                        : "border-[#8B1538] dark:border-primary text-[#8B1538] dark:text-primary hover:bg-[#8B1538] dark:hover:bg-primary hover:text-white"
                    }`}
                    disabled={isLoading}
                  >
                    Tutor
                  </Button>
                </div>
                {formErrors.role && (
                  <p className="text-sm text-red-600 dark:text-red-400 font-serif mt-1">{formErrors.role}</p>
                )}
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  onClick={onRegisterSubmit}
                  className="w-full h-12 font-serif bg-[#8B1538] dark:bg-primary hover:bg-[#8B1538]/90 dark:hover:bg-primary/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <Button
                  onClick={onBackToSignIn}
                  variant="ghost"
                  className="w-full font-serif text-[#8B1538] dark:text-primary hover:bg-[#8B1538]/10 dark:hover:bg-primary/10"
                  disabled={isLoading}
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
            )}
          </CardContent>
        </Card>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md border-2 border-border bg-card">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-serif text-[#8B1538] dark:text-primary">Account Created Successfully!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="font-serif text-muted-foreground">
                  Your account has been created. You can now sign in to access the platform.
                </p>
                <Button
                  onClick={onSuccessModalClose}
                  className="w-full h-12 font-serif bg-[#8B1538] dark:bg-primary hover:bg-[#8B1538]/90 dark:hover:bg-primary/90 text-white"
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Accessibility Assistance Button */}
        <Card className="border-2 border-[#8B1538] dark:border-primary bg-[#8B1538]/5 dark:bg-primary/5">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <h3 className="font-serif font-semibold text-[#8B1538] dark:text-primary">
                Need Assistance?
              </h3>
              <p className="text-sm text-muted-foreground font-serif">
                If you have difficulty typing or navigating this form due to a disability, we're here to help.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => window.location.href = 'tel:+15096209481'}
                  className="w-full h-12 font-serif bg-[#8B1538] dark:bg-primary hover:bg-[#8B1538]/90 dark:hover:bg-primary/90 text-white"
                >
                  Call for Assistance: (509) 620-9481
                </Button>
                <p className="text-xs text-muted-foreground font-serif">
                  Our accessibility support team can help you register and navigate the platform
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground font-serif">
          General support:{" "}
          <a href="mailto:support@fhda.edu" className="text-[#8B1538] dark:text-primary hover:underline">
            support@fhda.edu
          </a>
        </div>
      </div>
    </div>
  )
}
