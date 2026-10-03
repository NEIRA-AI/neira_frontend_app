interface AuthPageHeadingProps {
  title: string;
  description: string;
}

export function AuthPageHeading({ title, description }: AuthPageHeadingProps) {
  return (
    <header className="space-y-2 text-center">
      <h1 className="bg-gradient-to-r from-ink to-muted bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
        {title}
      </h1>
      <p className="text-base text-muted">{description}</p>
    </header>
  );
}
