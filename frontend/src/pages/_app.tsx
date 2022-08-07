import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMyAddress } from "../services/api";

const ownerAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

declare let window: any;

function MyApp({ Component, pageProps }: AppProps) {
  const [myAddress, setMyAddress] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const address = await getMyAddress();
      setMyAddress(address ?? "");
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (myAddress === ownerAddress) {
        return router.push("/admin");
      }

      return router.push("/voter");
    })();
  }, [myAddress, router.asPath]);
  return (
    <ChakraProvider>
      <Component {...pageProps} />
      <ToastContainer />
    </ChakraProvider>
  );
}
export default MyApp;
