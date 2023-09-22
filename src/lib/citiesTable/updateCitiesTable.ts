import prisma from '@/lib/prisma';

type tApiCity = {
  nome: string;
  codigo_ibge: string;
};

export default async function updateCitiesTable(
  cityCode: string,
  state: string,
): Promise<boolean> {
  const apiResponse = await fetch(
    `https://brasilapi.com.br/api/ibge/municipios/v1/${state}?providers=gov`,
  );

  if (!apiResponse || !apiResponse.ok) {
    console.error(apiResponse.body);
    return false;
  }

  const citiesList = await apiResponse.json();

  const cityToIsert: tApiCity = citiesList.find((apiCity: tApiCity) => {
    return apiCity.codigo_ibge === cityCode;
  });

  if (!cityToIsert) return false;

  try {
    const cityInserted = await prisma.cities.create({
      data: {
        code: cityCode,
        state,
        name: cityToIsert.nome,
      },
    });

    if (!cityInserted) {
      console.error(cityInserted);
      return false;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }

  return true;
}
