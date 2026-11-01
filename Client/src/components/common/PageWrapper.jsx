import React, { useEffect } from "react";
import { motion } from "framer-motion";

const variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

const PageWrapper = ({ children, className = "" }) => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
            className={`page-wrapper ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default PageWrapper;
