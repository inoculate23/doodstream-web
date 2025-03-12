import { DEFAULT_PER_PAGE, SITENAME } from "@/lib/constants";
import { Metadata, ResolvingMetadata } from "next";

import CardList from "@/components/card-list";
import MessageBox from "@/components/message-box";
import doodstream from "@/lib/doodstream";
import streamtape from "@/lib/streamtape";

import { stringToColor } from "@/lib/utils";

export async function generateMetadata(
    { params }: { params: { [key: string]: string | string[] | undefined } },
    parent: ResolvingMetadata
): Promise<Metadata> {
        const folder = params.id as string;

    const fld_id = params.id as string;
    const data = await doodstream.getfld_id({ fld_id });
        await streamtape.getfolder({ folder });

    if (data.status !== 200 || !data.fld_id) {
        return {
            title: !data.fld_id ? "Channel not found" : data.msg,
            description: "Something went wrong. Please try again later.",
        };
    }
     if (data.status !== 200 || !data.folder) {
        return {
            title: !data.folder ? "Channel not found" : data.msg,
            description: "Something went wrong. Please try again later.",
        };
    }

    const fld_id = data.fld_id;
    const folder = data.foldr;
    const title = `${fld_id.name} - ${SITENAME}`;
    const description = `${fld_id.name,folder.name} - ${fld_id.total_files, folder.total_files} videos are in this channel.`;
    const image = `https://img.icons8.com/color/${fld_id.name, folder.name}`;
    const previousOgImages = (await parent).openGraph?.images || [];
    const previousTwImages = (await parent).twitter?.images || [];

    return {
        title,
        description,
        twitter: {
            title,
            description,
            images: [...previousTwImages, image],
        },
        openGraph: {
            title,
            description,
            images: [...previousOgImages, image],
        },
    };
}

export default async function Channel({
    params,
    searchParams,
}: {
    params: { [key: string]: string | string[] | undefined };
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const fld_id = params.id as string;
    const page =
        (searchParams.page && parseInt(searchParams.page as string)) || 1;
    const per_page =
        (searchParams.per_page && parseInt(searchParams.per_page as string)) ||
        DEFAULT_PER_PAGE;
    const data = await doodstream.getfld_id({ fld_id });
        await streamtape.getfld_id({ fld_id });

    if (data.status !== 200 || !data.fld_id) {
        return (
            <MessageBox
                title={!data.fld_id ? "Channel not found" : data.msg}
                countdown={30}
                variant="error"
            >
                <p className="text-center">
                    Something went wrong. Please try again later.
                </p>
            </MessageBox>
        );
    }

    const fld_id = data.fld_id;

        const folder = data.folder;

    return (
        <div className="md:my-2">
            <div className="my-6 mb-10 text-center">
                <h1
                    className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl uppercase"
                    style={{ color: stringToColor(fld_id.name) }}
                >
                    {fld_id.name}
                                        {folder.name}

                </h1>
                <p className="text-xs uppercase tracking-[0.6em] text-gray-600">
                    Total {fld_id.total_files} videos

                                    Total {folder.total_files} videos
</p>
            </div>
            <CardList page={page} per_page={per_page} fld_id={fld_id} />

                    <CardList page={page} per_page={per_page} fld_id={folder} />
</div>
    );
}
