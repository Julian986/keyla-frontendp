import { ReactNode, forwardRef } from "react";
import "./Main.css";

type MainProps = {
  children: ReactNode;
};

// Usar forwardRef para permitir que Main reciba la referencia
const Main = forwardRef<HTMLDivElement, MainProps>(({ children }, ref) => {
  return (
    <main ref={ref} className="mainContainer">
      {children}
    </main>
  );
});

export default Main;
