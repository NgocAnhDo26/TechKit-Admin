import { prisma } from '../../config/config.js';
import { getUrl } from '../util/util.js';

async function fetchAccountsByQuery(query) {
    const {
        name,
        email,
        isBanned,
        sortBy,
        sortOrder,
        page = 1,
        pageSize = 10
    } = query;

    try {
        const totalRecords = await prisma.account.count({
            where: {
                AND: [
                    ...(name ? [{ name: { contains: name } }] : []),
                    ...(email ? [{ email: { contains: email } }] : []),
                    ...(isBanned !== undefined
                        ? [{ is_lock: isBanned === 'true' }] // Filter based on is_lock
                        : [])
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
                    ...(name ? [{ name: { contains: name } }] : []),
                    ...(email ? [{ email: { contains: email } }] : []),
                    ...(isBanned !== undefined
                        ? [{ is_lock: isBanned === 'true' }] // Filter based on is_lock
                        : [])
                ]
            },
            orderBy: sortBy ? orderBy : undefined, // Dynamically apply sorting
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                name: true,
                email: true,
                address: true,
                birthdate: true,
                sex: true,
                create_time: true,
                is_admin: true,
                is_lock: true
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

async function fetchAccountByID(account_id) {
    try {
      // Fetch the account details by account_id
      const account = await prisma.account.findUnique({
        where: { id: Number(account_id) },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          birthdate: true,
          sex: true,
          create_time: true,
          avatar: true,
          is_lock: true,
          is_admin: true,
        },
      });
  
      if (!account) {
        return {message: 'Account not found' };
      }
      account.avatar_url = getUrl(account.avatar)
  
      return account;
    } catch (error) {
      console.error('Error fetching account by ID:', error);
      return {message: 'Internal server error' };
    }
  }
  

async function toggleBanAccountByID(account_id) {
    try {
        // Check if the account exists
        const account = await prisma.account.findUnique({
            where: { id: Number(account_id) },
            select: { id: true, is_lock: true },
        });

        if (!account) {
            return { success: false, message: 'No account found' };
        }

        // Toggle the account's locked status
        const newLockStatus = account.is_lock ? false : true;  // Toggle between true and false

        // Update the account's status
        await prisma.account.update({
            where: { id: account_id },
            data: {
                is_lock: newLockStatus,
            },
        });

        const action = newLockStatus ? 'banned' : 'unbanned';
        return { success: true, message: `Account successfully ${action}` };
    } catch (error) {
        console.error('Error toggling account ban status:', error);
        return { success: false, message: 'Internal server error' };
    }
}

export {
    fetchAccountsByQuery,
    fetchAccountByID,
    toggleBanAccountByID
};
