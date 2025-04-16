import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export enum AnimationType {
  FadeIn = "FadeIn",
  FadeOut = "FadeOut",
  SlideIn = "SlideIn",
  SlideOut = "SlideOut",
  ScaleIn = "ScaleIn",
  ScaleOut = "ScaleOut",
  RotateIn = "RotateIn",
}

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  title: string;
  message: string;
  animationType?: AnimationType;
  animationDuration?: number;
  animationDelay?: number;
  width?: string;
  height?: string;
  hoverAnimation?: boolean;
  deleteButtonAnimation?: boolean;
  cancelButtonAnimation?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  title,
  message,
  animationType = AnimationType.FadeIn,
  animationDuration = 300,
  animationDelay = 0,
  width = "400px",
  height = "auto",
  hoverAnimation = true,
  deleteButtonAnimation = true,
  cancelButtonAnimation = true,
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      // Add overflow hidden to body when modal is open to prevent scrolling
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      // Restore overflow when modal closes
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Animation variants based on the animationType
  const getModalAnimations = () => {
    switch (animationType) {
      case AnimationType.FadeIn:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
      case AnimationType.SlideIn:
        return {
          initial: { y: -50, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: 50, opacity: 0 },
        };
      case AnimationType.SlideOut:
        return {
          initial: { x: -50, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: 50, opacity: 0 },
        };
      case AnimationType.ScaleIn:
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.8, opacity: 0 },
        };
      case AnimationType.ScaleOut:
        return {
          initial: { scale: 1.2, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 1.2, opacity: 0 },
        };
      case AnimationType.RotateIn:
        return {
          initial: { rotate: -10, opacity: 0 },
          animate: { rotate: 0, opacity: 1 },
          exit: { rotate: 10, opacity: 0 },
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  // Button hover animations
  const buttonHoverAnimation = hoverAnimation
    ? {
        scale: 1.05,
        transition: { duration: 0.2 },
      }
    : {};

  // Delete button animation
  const deleteButtonVariants = deleteButtonAnimation
    ? {
        initial: { scale: 1 },
        hover: buttonHoverAnimation,
        tap: { scale: 0.95 },
      }
    : {};

  // Cancel button animation
  const cancelButtonVariants = cancelButtonAnimation
    ? {
        initial: { scale: 1 },
        hover: buttonHoverAnimation,
        tap: { scale: 0.95 },
      }
    : {};

  // Backdrop animation
  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-opacity-40"
          onClick={handleBackdropClick}
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: animationDuration / 1000 }}
        >
          <motion.div
            className="rounded-lg shadow-lg overflow-hidden max-w-lg mx-4"
            style={{
              width: width,
              minHeight: height,
              backgroundColor: "var(--surface)",
              color: "var(--text-primary)",
              borderColor: "var(--border)",
              boxShadow: "0 4px 12px var(--shadow)",
            }}
            variants={getModalAnimations()}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: animationDuration / 1000,
              delay: animationDelay / 1000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  Are you sure to delete {title}?
                </h2>
                <button
                  onClick={onClose}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <p className="text-[var(--text-secondary)] mb-6">{message}</p>

              <div className="flex justify-end space-x-4 mt-6">
                <motion.button
                  variants={cancelButtonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="bg-[var(--surface-lighter)] hover:bg-[var(--border)] text-[var(--text-primary)] font-medium py-2 px-4 rounded transition-colors"
                  onClick={onClose}
                >
                  Cancel
                </motion.button>

                <motion.button
                  variants={deleteButtonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
                  onClick={onDelete}
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteModal;
