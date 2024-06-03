import fetchApp from '@/lib/fetchApp';
import { headers } from 'next/headers';
import { tProjectTableRow } from '@/types/Project/tProject';
import { projectTableColumns } from './registerFields';
import ProjectTable from './components/projectTable';

const getProjects = async (): Promise<tProjectTableRow[]> => {
  try {
    const projects = await fetchApp({
      endpoint: `/api/internal/projects?orderBy=name&tableList=true`,
      rscHeaders: headers(),
    });
    return projects.body;
  } catch (error) {
    console.error(`${error}`);
    throw error;
  }
};

export default async function Projects() {
  const projects = await getProjects();
  return (
    <>
      <ProjectTable
        registerData={projects}
        registerColumns={projectTableColumns}
      />
    </>
  );
}
