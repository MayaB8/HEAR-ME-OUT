
export const voiceOptions = {
    man: { label: "גבר" },
    woman: { label: "אישה" },
};

export const manWomanOptions = [
    voiceOptions.man,
    voiceOptions.woman,
];

export const placeInWordOp = {
    end: { label: "סוף", value: "end" },
    middle: { label: "אמצע", value: "middle" },
    start: { label: "התחלה", value: "start" },
    all: { label: "הכל", value: "הכל" },
};

export const options = [
    {
        label: "אופן חיתוך",
        value: "אופן חיתוך",
        letterOptions: [
            {
                label: "הכל",
                sounds: "",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },
            {
                label: "ת,ט-צ",
                sounds: "ts-t",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                ],
            },
            {
                label: "ס-צ",
                sounds: "ts-s",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },
            {
                label: "ק,כ-ח",
                sounds: "x-k",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                ],
            },
            {
                label: "נ-ל",
                sounds: "l-m",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },
        ],
    },
    {
        label: "קוליות",
        value: "קוליות",
        letterOptions: [
            {
                label: "הכל",
                sounds: "",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },
            {
                label: "ס-ז",
                sounds: "z-s",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },
            {
                label: "ו-ף",
                sounds: "f-v",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },
            {
                label: "ר-ח",
                sounds: "x-r",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },
            {
                label: "ב-פ",
                sounds: "p-b",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                ],
            },
            {
                label: "ט,ת-ד",
                sounds: "d-t",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },
            {
                label: "כ,ק-ג",
                sounds: "g-k",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },

        ],
    },
    {
        label: "מקום חיתוך",
        value: "מקום חיתוך",
        letterOptions: [
            {
                label: "הכל",
                sounds: "",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },
            {
                label: "ש-ס",
                sounds: "s-sh",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },
            {
                label: "ש-ף",
                sounds: "f-sh",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.end
                ],
            },
            {
                label: "ס-ף",
                sounds: "f-s",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.end
                ],
            },
            {
                label: "ס-ח",
                sounds: "x-s",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.middle,
                ],
            },
            {
                label: "פ-ת,ט",
                sounds: "t-p",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                ],
            },
            {
                label: "ת,ט-ק,כ",
                sounds: "k-t",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },
            {
                label: "ג-ד",
                sounds: "d-g",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },
            {
                label: "מ-נ",
                sounds: "n-m",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },
            {
                label: "ר-ב,ו",
                sounds: "v-r",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                    placeInWordOp.middle,
                    placeInWordOp.end
                ],
            },
            {
                label: "פ-ק,כ",
                sounds: "k-p",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                ],
            },
            {
                label: "ח-ף",
                sounds: "f-x",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.end,
                ],
            },
            {
                label: "ש-ח",
                sounds: "x-sh",
                placeInWordOptions: [
                    placeInWordOp.all,
                    placeInWordOp.start,
                ],
            },

        ],
    }
];
