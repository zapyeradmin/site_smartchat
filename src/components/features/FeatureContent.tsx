import { motion } from "framer-motion";

interface FeatureContentProps {
  image: string;
  title: string;
}

export const FeatureContent = ({ image, title }: FeatureContentProps) => {
  // Verificar se é a imagem específica que precisa ser aumentada
  const isTargetImage = image === "/lovable-uploads/b6436838-5c1a-419a-9cdc-1f9867df073d.png";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex items-center justify-center"
    >
      <div className="overflow-hidden w-full relative">
        <div className="absolute inset-0 bg-transparent" />
        <img
          src={image}
          alt={title}
          className={`w-flex h-flex object-contain relative z-10 ${
            isTargetImage 
              ? "transform scale-150 -translate-y-600" 
              : ""
          }`}
        />
      </div>
    </motion.div>
  );
};