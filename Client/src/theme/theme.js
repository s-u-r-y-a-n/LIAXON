import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#0B0B0B", // Deep Pitch Black
            light: "#1A1A1A",
            dark: "#000000",
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: "#D4AF37", // Liaxon Official Metallic Gold
            light: "#E5C158",
            dark: "#B89628",
            contrastText: "#0B0B0B",
        },
        info: {
            main: "#D4AF37",
            light: "rgba(212, 175, 55, 0.15)",
            dark: "#B89628",
        },
        success: {
            main: "#10B981",
            light: "#ECFDF5",
            dark: "#047857",
        },
        warning: {
            main: "#D4AF37",
            light: "rgba(212, 175, 55, 0.12)",
            dark: "#B89628",
        },
        error: {
            main: "#EF4444",
            light: "#FEF2F2",
            dark: "#B91C1C",
        },
        background: {
            default: "#FFFFFF",
            paper: "#FFFFFF",
        },
        text: {
            primary: "#0B0B0B",
            secondary: "#555555",
            disabled: "#999999",
        },
        divider: "rgba(212, 175, 55, 0.2)",
    },
    typography: {
        fontFamily: [
            "Inter",
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            "sans-serif",
        ].join(","),
        h4: {
            fontWeight: 700,
            letterSpacing: "-0.02em",
        },
        h5: {
            fontWeight: 700,
            letterSpacing: "-0.01em",
        },
        h6: {
            fontWeight: 600,
            letterSpacing: "-0.01em",
        },
        subtitle1: {
            fontWeight: 500,
        },
        subtitle2: {
            fontWeight: 600,
        },
        button: {
            textTransform: "none",
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 10,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: "8px 18px",
                    boxShadow: "none",
                    "&:hover": {
                        boxShadow: "0 4px 12px rgba(212, 175, 55, 0.2)",
                    },
                },
                containedPrimary: {
                    backgroundColor: "#0B0B0B",
                    color: "#FFFFFF",
                    "&:hover": {
                        backgroundColor: "#1A1A1A",
                    },
                },
                containedSecondary: {
                    backgroundColor: "#D4AF37",
                    color: "#0B0B0B",
                    fontWeight: 700,
                    "&:hover": {
                        backgroundColor: "#E5C158",
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                },
                elevation1: {
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderColor: "rgba(0, 0, 0, 0.06)",
                    padding: "14px 16px",
                },
                head: {
                    backgroundColor: "#F8F8F8",
                    color: "#555555",
                    fontWeight: 700,
                    fontSize: "0.8125rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    borderRadius: 6,
                },
            },
        },
    },
});

export default theme;
