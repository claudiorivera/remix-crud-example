import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
	json,
	useActionData,
	useLoaderData,
	useSearchParams,
} from "@remix-run/react";
import { catSchema } from "~/lib/cat-schema";
import { db } from "~/lib/db.server";

export function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	return db.cat.findMany({
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
			},
		);

	const cat = await db.cat.create({
		data: validation.data,
	});

	if (cat) {
		return null;
	}
}

export default function Cats() {
	const loaderData = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();

	const [searchParams] = useSearchParams();

	return (
		<>
			<h1>Home</h1>

			<hr />

			<h2>Search Cats</h2>
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
				<button type="button">Search</button>
			</form>

			<h3>Results</h3>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Age</th>
					</tr>
				</thead>
				<tbody>
					{loaderData.map((cat) => (
						<tr key={cat.id}>
							<td>{cat.name}</td>
							<td>{cat.age}</td>
							<td>
								<a href={`/cats/${cat.id}`}>View</a>
							</td>
							<td>
								<form method="post" action={`/cats/${cat.id}`}>
									<input type="hidden" name="action" value="delete" />
									<button type="button">Delete</button>
								</form>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<hr />

			<h2>Add New Cat</h2>
			<form method="post" action="/?index">
				<div>
					<label>
						Name
						<input type="text" name="name" />
						{actionData?.fieldErrors?.name && (
							<div>{actionData.fieldErrors.name}</div>
						)}
					</label>
				</div>
				<div>
					<label>
						Age
						<input type="number" inputMode="numeric" name="age" />
						{actionData?.fieldErrors?.age && (
							<div>{actionData.fieldErrors.age}</div>
						)}
					</label>
				</div>

				<button type="submit">Save Changes</button>
			</form>
		</>
	);
}
