import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#0F172A",
            light: "#1E293B",
            dark: "#020617",
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: "#2563EB",
            light: "#3B82F6",
            dark: "#1D4ED8",
            contrastText: "#FFFFFF",
        },
        info: {
            main: "#0EA5E9",
            light: "#E0F2FE",
            dark: "#0369A1",
        },
        success: {
            main: "#10B981",
            light: "#ECFDF5",
            dark: "#047857",
        },
        warning: {
            main: "#F59E0B",
            light: "#FFFBEB",
            dark: "#B45309",
        },
        error: {
            main: "#EF4444",
            light: "#FEF2F2",
            dark: "#B91C1C",
        },
        background: {
            default: "#F8FAFC",
            paper: "#FFFFFF",
        },
        text: {
            primary: "#0F172A",
            secondary: "#64748B",
            disabled: "#94A3B8",
        },
        divider: "#E2E8F0",
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
                        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
                    },
                },
                containedPrimary: {
                    backgroundColor: "#0F172A",
                    "&:hover": {
                        backgroundColor: "#1E293B",
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
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
                    borderColor: "#F1F5F9",
                    padding: "14px 16px",
                },
                head: {
                    backgroundColor: "#F8FAFC",
                    color: "#475569",
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
