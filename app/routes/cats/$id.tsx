import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { createCatSchema } from "~/lib/createCatSchema";
import { prisma } from "~/lib/prisma.server";

export function loader({ params }: LoaderArgs) {
  return prisma.cat.findUnique({
    where: {
      id: params.id,
    },
  });
}

export async function action({ request, params }: ActionArgs) {
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

  const cat = await prisma.cat.update({
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
  const actionData = useActionData();
  const loaderData = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Cat Details</h1>

      <Form method="post">
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
      </Form>
    </>
  );
}
