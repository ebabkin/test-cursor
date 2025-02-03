import { GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

function ApiDoc({ spec }: { spec: Record<string, any> }) {
  return <SwaggerUI spec={spec} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const spec = await fetch('http://localhost:3000/api/docs').then(res => res.json());
  return {
    props: {
      spec,
    },
  };
};

export default ApiDoc; 