import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { createCatSchema } from "~/lib/createCatSchema";
import { db } from "~/lib/db.server";

export function loader({ params }: LoaderFunctionArgs) {
  return db.cat.findUnique({
    where: {
      id: params.id,
    },
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = Object.fromEntries(await request.formData());

  if (formData.action === "delete") {
    const cat = await db.cat.delete({
      where: {
        id: params.id,
      },
    });

    if (cat) {
      return redirect("/");
    }
  }

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

  const cat = await db.cat.update({
    where: {
      id: params.id,
    },
    data: validation.data,
  });

  if (cat) {
    return redirect("/");
  }
}

export default function Cat() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Cat Details</h1>

      <form method="post">
        <div>
          <label>
            Name
            <input type="text" name="name" defaultValue={loaderData?.name} />
            {actionData?.fieldErrors?.name && (
              <div>{actionData.fieldErrors.name}</div>
            )}
          </label>
        </div>
        <div>
          <label>
            Age
            <input
              type="number"
              inputMode="numeric"
              name="age"
              defaultValue={loaderData?.age}
            />
            {actionData?.fieldErrors?.age && (
              <div>{actionData.fieldErrors.age}</div>
            )}
          </label>
        </div>

        <button>Save Changes</button>
      </form>
    </>
  );
}
