# Training data sources

Raw files are not committed (see `credit-service/.gitignore`) — download them manually and place them at the paths below.

## 1. Give Me Some Credit (financial/demographic PD labels)

- Source: https://www.kaggle.com/c/GiveMeSomeCredit
- Download `cs-training.csv` from the competition's "Data" tab (requires joining the competition — free, one click).
- Place at: `data/raw/give-me-some-credit/cs-training.csv`
- Target column: `SeriousDlqin2yrs` (1 = defaulted within 2 years).

## 2. PaySim (simulated mobile-money transactions)

- Source: https://www.kaggle.com/datasets/ealaxi/paysim1
- Download the dataset (single CSV inside the zip, named like `PS_20174392719_1491204439457_log.csv`).
- Place at: `data/raw/paysim/paysim.csv` (rename after extracting).
- Used only to derive realistic transactional *behavior* features (velocity, amounts, inbound/outbound ratios) — per the perfil's own limitation, this stands in for real transaction-service activity and is combined synthetically with the credit dataset via a generated user_id join key.
