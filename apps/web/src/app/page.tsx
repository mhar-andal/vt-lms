import { Metadata } from "next";
import { Button, Card, CardHeader, CardTitle, CardDescription } from "@vt/ui";
import { UserButton } from "@clerk/nextjs/app-beta";
import CatelogCard from "../components/CatelogCard";

export const metadata: Metadata = {
  title: "LMS",
};

export default function Home() {
  return (
    <div className="h-full w-full">
      <div className="my-10 grid grid-cols-3 gap-4 px-10">
        <CatelogCard
          title="Mathematics Catalog: Unlock the Power of Numbers!"
          description="Discover a world of mathematical wonders in our Math category.
              Immerse yourself in the art of problem-solving and uncover the
              beauty hidden within equations. From algebraic puzzles to
              geometric conundrums, our curated collection offers a diverse
              range of math problems for all levels of expertise. Sharpen your
              analytical skills, expand your logical thinking, and embark on a
              captivating journey through the realm of numbers. Join us and
              unravel the mysteries that lie within the fascinating universe of
              mathematics!"
        />
        <CatelogCard
          title="Physics Catalog: Exploring the World of Physics"
          description="Welcome to our Physics Catalog! Explore a universe of knowledge
              and dive into the fascinating realm of physics problem-solving.
              Unleash your curiosity as we unravel the mysteries of the cosmos,
              from quantum mechanics to relativity and beyond. Expand your
              understanding of the natural world with our diverse collection of
              physics challenges. Join us on this exhilarating journey and
              unlock the secrets of the universe, one problem at a time."
        />
      </div>
    </div>
  );
}
