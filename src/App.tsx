import { useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import { useFinanceStore } from "./store/financeStore";

export default function App() {
  const init = useFinanceStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return <AppRouter />;
}
