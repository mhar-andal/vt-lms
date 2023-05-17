import { Button, Card, CardHeader } from "@vt/ui";
import { CardTitle } from "@vt/ui";
import { CardDescription } from "@vt/ui";

export default function CatelogCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <Card className="min-h-[378px]">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="min-h-full text-xs">
            {description}
          </CardDescription>

          <Button className="">Enter</Button>
        </CardHeader>
      </Card>
    </div>
  );
}
