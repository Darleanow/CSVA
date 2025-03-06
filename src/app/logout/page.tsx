"use client";

import { useAuth } from "@/context/auth-context";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Container,
    Typography,
    Paper,
    CircularProgress,
    Avatar,
    Fade
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

const calculateProgressValue = (countdown: number, total: number): number => {
    return (countdown / total) * 100;
};

const formatCountdownText = (countdown: number, isSigningOut: boolean): string => {
    if (isSigningOut) {
        return "Processing...";
    }

    const suffix = countdown !== 1 ? 's' : '';
    return `Redirecting to homepage in ${countdown} second${suffix}...`;
};

export default function Logout() {
    const { signOut } = useAuth();
    const router = useRouter();
    const [countdown, setCountdown] = useState(3);
    const [isSigningOut, setIsSigningOut] = useState(true);
    const totalCountdown = 3;

    const navigateToHome = useCallback(() => {
        router.push("/");
    }, [router]);

    const decrementCountdown = useCallback(() => {
        setCountdown((prev) => {
            if (prev <= 1) {
                setTimeout(navigateToHome, 0);
                return 0;
            }
            return prev - 1;
        });
    }, [navigateToHome]);

    useEffect(() => {
        let isMounted = true;

        const performSignOut = async () => {
            try {
                await signOut();
                if (isMounted) {
                    setIsSigningOut(false);
                }
            } catch (error) {
                console.error("Error signing out:", error);
                if (isMounted) {
                    setIsSigningOut(false);
                }
            }
        };

        performSignOut();

        return () => {
            isMounted = false;
        };
    }, [signOut]);

    useEffect(() => {
        if (isSigningOut) return;

        const timer = setInterval(decrementCountdown, 1000);
        return () => clearInterval(timer);
    }, [isSigningOut, decrementCountdown]);

    const progressValue = isSigningOut
        ? undefined
        : calculateProgressValue(countdown, totalCountdown);

    const countdownText = formatCountdownText(countdown, isSigningOut);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default"
            }}
        >
            <Container maxWidth="sm">
                <Fade in={true} timeout={800}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            textAlign: "center",
                            borderRadius: 2
                        }}
                    >
                        <Avatar
                            sx={{
                                bgcolor: "success.light",
                                width: 60,
                                height: 60,
                                mx: "auto",
                                mb: 2
                            }}
                        >
                            <LogoutIcon fontSize="large" />
                        </Avatar>

                        <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
                            {isSigningOut ? "Signing Out..." : "Signed Out Successfully"}
                        </Typography>

                        <Typography variant="body1" color="text.secondary" paragraph>
                            Thank you for using our application. You have been successfully logged out.
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 2 }}>
                            <CircularProgress
                                size={24}
                                thickness={5}
                                variant={isSigningOut ? "indeterminate" : "determinate"}
                                value={progressValue}
                                sx={{ mr: 1.5, color: "primary.main" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                {countdownText}
                            </Typography>
                        </Box>
                    </Paper>
                </Fade>
            </Container>
        </Box>
    );
}