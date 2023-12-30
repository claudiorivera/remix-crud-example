import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { catSchema } from "~/lib/catSchema";
import { db } from "~/lib/db.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = Object.fromEntries(await request.formData());

  const validation = catSchema.safeParse(formData);

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

  const cat = await db.cat.create({
    data: validation.data,
  });

  if (cat) {
    return redirect("/");
  }
}

export default function NewCat() {
  const data = useActionData<typeof action>();

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
