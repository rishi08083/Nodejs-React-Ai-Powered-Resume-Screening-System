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
enum AnimationType {
  FadeIn,
  FadeOut,
  SlideIn,
  SlideOut,
  ScaleIn,
  ScaleOut,
  RotateIn,
}
