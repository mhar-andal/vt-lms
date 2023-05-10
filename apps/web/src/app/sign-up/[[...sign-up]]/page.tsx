import { SignUp } from "@clerk/nextjs/app-beta";

const SignUpPage = () => (
  <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
);

export default SignUpPage;
