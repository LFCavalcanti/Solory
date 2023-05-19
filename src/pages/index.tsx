import { trpc } from 'src/utils/trpc';

export default function IndexPage() {
  const hello = trpc.hello.useQuery({ text: 'Solory' });
  if (!hello.data) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <p>{hello.data.greeting}</p>
    </div>
  );
}
