import TopNav from "../components/TopNav";


export default function MainLayout({ children }) {
  return (
    <main className=" max-h-screen h-screen max-w-360 mx-auto w-full flex flex-1 flex-col items-center justify-start font-sans ">
       
       <TopNav/>
       {children}
    </main>
  );
}
