import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { createCatSchema } from "~/lib/createCatSchema";
import { prisma } from "~/lib/prisma.server";

export async function action({ request }: ActionArgs) {
  const formData = Object.fromEntries(await request.formData());

  const validation = createCatSchema.safeParse(formData);

  if (!validation.success)
    return json(
      {
        fieldErrors: validation.error.flatten().fieldErrors,
        formErrors: validation.error.flatten().formErrors,
      },
      {
        status: 400,
      }
    );

  const cat = await prisma.cat.create({
    data: validation.data,
  });

  if (cat) {
    return redirect("/");
  }
}

export default function NewCat() {
  const data = useActionData();

  return (
    <>
      <h1>New Cat</h1>

      <form method="post">
        <div>
          <label>
            Name
            <input type="text" name="name" />
            {data?.fieldErrors?.name && <div>{data.fieldErrors.name}</div>}
          </label>
        </div>
        <div>
          <label>
            Age
            <input type="number" inputMode="numeric" name="age" />
            {data?.fieldErrors?.age && <div>{data.fieldErrors.age}</div>}
          </label>
        </div>

        <button>Save Changes</button>
      </form>
    </>
  );
}
