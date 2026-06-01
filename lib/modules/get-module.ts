import { getPrisma } from "@/lib/prisma"

export async function getModuleByNumber(moduleNumber: string) {
  const prisma = getPrisma()
  const module = await prisma.module.findUnique({
    where: {
      moduleNumber: moduleNumber.toUpperCase(),
    },
    include: {
      semesters: {
        select: {
          id: true,
          name: true,
          year: true,
        },
        orderBy: [
          { year: "desc" },
          { name: "desc" },
        ],
      },
    },
  })

  return module
}