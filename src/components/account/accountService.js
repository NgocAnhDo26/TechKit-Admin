import { prisma } from '../../config/config.js';

async function fetchAccountsByQuery(query) {
    const {
        name,
        email,
        sortBy,
        sortOrder,
        page = 1,
        pageSize = 10
    } = query;

    try {
        // Count total records with applied filters
        const totalRecords = await prisma.account.count({
            where: {
                AND: [
                    ...(name ? [{ name: { contains: name} }] : []),
                    ...(email ? [{ email: { contains: email} }] : [])
                ]
            }
        });

        // Calculate total pages
        const totalPages = Math.ceil(totalRecords / pageSize);

        // Build the sorting object dynamically based on sortBy and sortOrder
        const orderBy = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder || 'asc'; // Default to 'asc' if no sortOrder is provided
        }

        // Fetch the paginated accounts with sorting and filters applied
        const accounts = await prisma.account.findMany({
            where: {
                AND: [
                    ...(name ? [{ name: { contains: name} }] : []),
                    ...(email ? [{ email: { contains: email} }] : [])
                ]
            },
            orderBy: sortBy ? orderBy : undefined, // Dynamically apply sorting
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                address: true,
                birthdate: true,
                sex: true,
                create_time: true
            }
        });

        // Return the result with pagination and accounts
        return {
            currentPage: page,
            totalPages: totalPages,
            accounts: accounts
        };
    } catch (error) {
        console.error('Error fetching accounts:', error);
        throw new Error('Failed to fetch accounts');
    }
}

async function banAccountByID(account_id) {
    try {
        // Check if the account exists and is not already banned
        const account = await prisma.account.findUnique({
            where: { id: account_id },
            select: { id: true, is_lock: true }
        });

        if (!account) {
            return { success: false, message: 'No account found' };
        }

        if (account.is_lock === 1) {
            return { success: false, message: 'Account is already banned'};
        }    

        // Update the account's status to banned (is_lock = 1)
        await prisma.account.update({
            where: { id: account_id },
            update: {
                is_lock: 1
            }
        });
        return { success: true,message: 'Account successfully banned' };
    } catch (error) {
        console.error('Error banning account:', error);
        return { success: false, message: 'Internal server error'};
    }
}

export {
    fetchAccountsByQuery,
    banAccountByID,
};
