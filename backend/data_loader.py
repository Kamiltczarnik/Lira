# to get the laoding from the csv

import pandas as pd
import os

def load_banking_data_pandas(data_directory="data"):
    """
    Loads banking data from CSV files in the specified directory using pandas.

    Args:
        data_directory (str): The directory containing the CSV files.

    Returns:
        dict: A dictionary containing loaded data as pandas DataFrames,
              with keys representing data types (e.g., "accounts", "transactions").
              Returns None if an error occurs.
    """

    data = {}

    try:
        # Load Accounts
        accounts_df = pd.read_csv(os.path.join(data_directory, "accounts.csv"))
        data["accounts"] = accounts_df

        # Load Customers
        customers_df = pd.read_csv(os.path.join(data_directory, "customers.csv"))
        data["customers"] = customers_df

        # Load Transactions
        transactions_df = pd.read_csv(os.path.join(data_directory, "transactions.csv"))
        data["transactions"] = transactions_df

        # Load Bills
        bills_df = pd.read_csv(os.path.join(data_directory, "bills.csv"))
        data["bills"] = bills_df

        # Load Loans
        loans_df = pd.read_csv(os.path.join(data_directory, "loans.csv"))
        data["loans"] = loans_df

        # Load Merchants
        merchants_df = pd.read_csv(os.path.join(data_directory, "merchants.csv"))
        data["merchants"] = merchants_df

    except FileNotFoundError as e:
        print(f"Error: CSV file not found: {e}")
        return None
    except pd.errors.ParserError as e:
        print(f"Error: CSV parsing error: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

    return data

if __name__ == "__main__":
    loaded_data = load_banking_data_pandas()
    if loaded_data:
        print("Data loaded successfully using pandas.")
        # Example: Accessing loaded data
        if "accounts" in loaded_data:
            print(f"Number of accounts: {len(loaded_data['accounts'])}")
            print(loaded_data['accounts'].head()) # Print the first few rows
        if "transactions" in loaded_data:
            print(f"Number of transactions: {len(loaded_data['transactions'])}")
            print(loaded_data['transactions'].head())