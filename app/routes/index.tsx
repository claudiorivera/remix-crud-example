import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { deleteCatSchema } from "~/lib/deleteCatSchema";
import { prisma } from "~/lib/prisma.server";

export function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);

  return prisma.cat.findMany({
    where: {
      AND: [
        {
          name: {
            contains: url.searchParams.get("name") || undefined,
            mode: "insensitive",
          },
        },
        {
          age: {
            gte: Number(url.searchParams.get("minAge")) || undefined,
            lte: Number(url.searchParams.get("maxAge")) || undefined,
          },
        },
      ],
    },
  });
}

export async function action({ request }: ActionArgs) {
  const formData = Object.fromEntries(await request.formData());

  const validation = deleteCatSchema.parse(formData);

  const cat = await prisma.cat.delete({
    where: {
      id: validation.id,
    },
  });

  if (cat) {
    return redirect("/");
  }
}

export default function Cats() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <>
      <h1>All Cats</h1>
      <form>
        <label>
          Name
          <input
            type="search"
            name="name"
            defaultValue={searchParams.get("name") || ""}
          />
        </label>
        <label>
          Min Age
          <input
            type="number"
            inputMode="numeric"
            name="minAge"
            defaultValue={searchParams.get("minAge") || ""}
          />
        </label>
        <label>
          Max Age
          <input
            type="number"
            inputMode="numeric"
            name="maxAge"
            defaultValue={searchParams.get("maxAge") || ""}
          />
        </label>
        <button type="reset">Reset</button>
        <button>Search</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          {data.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>{cat.age}</td>
              <td>
                <a href={`/cats/${cat.id}`}>View</a>
              </td>
              <td>
                <form method="post" action={`/cats/${cat.id}`}>
                  <input type="hidden" name="action" value="delete" />
                  <button>Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
