
export const parseCP = (cpStr: string): number => {
    if (!cpStr) return 0;
    const cleanStr = cpStr.toUpperCase().replace(/[^0-9.KMB]/g, '');
    let multiplier = 1;
    if (cleanStr.endsWith('K')) multiplier = 1000;
    else if (cleanStr.endsWith('M')) multiplier = 1000000;
    else if (cleanStr.endsWith('B')) multiplier = 1000000000;

    const numValue = parseFloat(cleanStr.replace(/[KMB]/g, ''));
    return isNaN(numValue) ? 0 : numValue * multiplier;
};
