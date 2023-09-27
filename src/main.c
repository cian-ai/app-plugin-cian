/*******************************************************************************
 *   Ethereum 2 Deposit Application
 *   (c) 2020 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ********************************************************************************/

#include <stdbool.h>
#include <stdint.h>
#include <string.h>

#include "os.h"
#include "cx.h"

#include "glyphs.h"

#include "cian_plugin.h"

// List of selectors supported by this plugin.
static const uint32_t VAULT_DEPOSIT_SELECTOR = 0x6e553f65;
static const uint32_t VAULT_WITHDRAW_SELECTOR = 0xb460af94;
static const uint32_t VAULT_DELEVERAGE_WITHDRAW_SELECTOR = 0x65ae14b5;
static const uint32_t VAULT_WRAPPER_DEPOSIT_SELECTOR = 0x4d447995;
static const uint32_t VAULT_WRAPPER_WITHDRAW_SELECTOR = 0x259f8d1a;
static const uint32_t VAULT_WRAPPER_DEPOSIT_WSTETH_SELECTOR = 0x5243318f;
static const uint32_t VAULT_WRAPPER_WITHDRAW_WSTETH_SELECTOR = 0x32ca494b;

const uint8_t ETHEREUM_STETH_VAULT_ADDR[ADDRESS_LENGTH] = {0xCD, 0xD3, 0x74, 0xF4, 0x91, 0xFB, 0xF3,
                                                           0xF4, 0xFC, 0xF6, 0xE9, 0x02, 0x3C, 0x99,
                                                           0x04, 0x37, 0x74, 0x00, 0x51, 0x37};

const uint8_t ETHEREUM_STETH_VAULT_WRAPPER_ADDR[ADDRESS_LENGTH] = {
    0x4E, 0x8E, 0x60, 0xCC, 0xDF, 0x79, 0xEB, 0xAA, 0x41, 0x89,
    0xD9, 0x1B, 0x5D, 0xC9, 0xB0, 0xF8, 0x5D, 0xF9, 0xA4, 0x27};

const uint8_t ETHEREUM_RETH_VAULT_ADDR[ADDRESS_LENGTH] = {0xB8, 0xC0, 0xC5, 0x0D, 0x25, 0x5B, 0x93,
                                                          0xF5, 0x27, 0x65, 0x49, 0xCB, 0xA7, 0xF4,
                                                          0xBF, 0x78, 0x75, 0x1A, 0x5D, 0x34};

const uint8_t ETHEREUM_RETH_VAULT_WRAPPER_ADDR[ADDRESS_LENGTH] = {
    0xCA, 0xD3, 0x11, 0x82, 0xFD, 0x45, 0x29, 0x8E, 0xEA, 0xC7,
    0x6A, 0xDA, 0x71, 0x96, 0x9C, 0xD0, 0xC7, 0x22, 0xA9, 0x49};

const uint8_t ARBITRUM_WSTETH_VAULT_ADDR[ADDRESS_LENGTH] = {
    0xE9, 0x46, 0xDD, 0x7D, 0x03, 0xF6, 0xF5, 0xC4, 0x40, 0xF6,
    0x8C, 0x84, 0x80, 0x8C, 0xA8, 0x8D, 0x26, 0x47, 0x5F, 0xC5};

const uint8_t ARBITRUM_WSTETH_VAULT_WRAPPER_ADDR[ADDRESS_LENGTH] = {
    0xF2, 0x25, 0x4B, 0x4D, 0xA1, 0xD6, 0x85, 0x40, 0xB8, 0x55,
    0xE4, 0xD2, 0x19, 0xAA, 0xC1, 0xEF, 0x0E, 0xDB, 0xA5, 0x75};

const uint8_t OPTIMISM_WSTETH_VAULT_ADDR[ADDRESS_LENGTH] = {
    0x90, 0x78, 0x83, 0xDA, 0x91, 0x7C, 0xA9, 0x75, 0x0A, 0xD2,
    0x02, 0xFF, 0x63, 0x95, 0xC4, 0xC6, 0xAB, 0x14, 0xE6, 0x0E};

const uint8_t OPTIMISM_WSTETH_VAULT_WRAPPER_ADDR[ADDRESS_LENGTH] = {
    0xE9, 0x46, 0xDD, 0x7D, 0x03, 0xF6, 0xF5, 0xC4, 0x40, 0xF6,
    0x8C, 0x84, 0x80, 0x8C, 0xA8, 0x8D, 0x26, 0x47, 0x5F, 0xC5};

const token_ticker_t TOKEN_TICKER_COLLECTION[TOKEN_TICKER_NUM] = {
    {{0xee, 0xee, 0xee, 0xee, 0xee, 0xee, 0xee, 0xee, 0xee, 0xee,  // any network token
      0xee, 0xee, 0xee, 0xee, 0xee, 0xee, 0xee, 0xee, 0xee, 0xee},
     "ETH"},
    {{0xC0, 0x2a, 0xAA, 0x39, 0xb2, 0x23, 0xFE, 0x8D, 0x0A, 0x0e,  // eth mainnet weth
      0x5C, 0x4F, 0x27, 0xEA, 0xD9, 0x08, 0x3C, 0x75, 0x6C, 0xc2},
     "WETH"},
    {{0xAE, 0x7A, 0xB9, 0x65, 0x20, 0xDE, 0x3A, 0x18, 0xE5, 0xE1,  // eth mainnet steth
      0x11, 0xB5, 0xEA, 0xAB, 0x09, 0x53, 0x12, 0xD7, 0xFE, 0x84},
     "STETH"},
    {{0x7F, 0x39, 0xC5, 0x81, 0xF5, 0x95, 0xB5, 0x3C, 0x5C, 0xB1,  // eth mainnet wsteth
      0x9B, 0xD0, 0xB3, 0xF8, 0xDA, 0x6C, 0x93, 0x5E, 0x2C, 0xA0},
     "WSTETH"},
    {{0xAE, 0x78, 0x73, 0x6C, 0xD6, 0x15, 0xF3, 0x74, 0xD3, 0x08,  // eth mainnet reth
      0x51, 0x23, 0xA2, 0x10, 0x44, 0x8E, 0x74, 0xFC, 0x63, 0x93},
     "RETH"},
    {{0x82, 0xAF, 0x49, 0x44, 0x7D, 0x8A, 0x07, 0xE3, 0xBD, 0x95,  // arbitrum weth
      0xBD, 0x0D, 0x56, 0xF3, 0x52, 0x41, 0x52, 0x3F, 0xBA, 0xB1},
     "WETH"},
    {{0x59, 0x79, 0xD7, 0xB5, 0x46, 0xE3, 0x8E, 0x41, 0x4F, 0x7E,  // arbitrum wsteth
      0x98, 0x22, 0x51, 0x4B, 0xE4, 0x43, 0xA4, 0x80, 0x05, 0x29},
     "WSTETH"},
    {{0x42, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,  // optimism weth
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x06},
     "WETH"},
    {{0x1F, 0x32, 0xB1, 0xC2, 0x34, 0x55, 0x38, 0xC0, 0xC6, 0xF5,  // optimism wsteth
      0x82, 0xFC, 0xB0, 0x22, 0x73, 0x9C, 0x4A, 0x19, 0x4E, 0xBB},
     "WETH"}};

// Array of all the different cian selectors. Make sure this follows the same order as the
// enum defined in `cian_plugin.h`
const uint32_t CIAN_SELECTORS[NUM_SELECTORS] = {
    VAULT_DEPOSIT_SELECTOR,
    VAULT_WITHDRAW_SELECTOR,
    VAULT_DELEVERAGE_WITHDRAW_SELECTOR,
    VAULT_WRAPPER_DEPOSIT_SELECTOR,
    VAULT_WRAPPER_WITHDRAW_SELECTOR,
    VAULT_WRAPPER_DEPOSIT_WSTETH_SELECTOR,
    VAULT_WRAPPER_WITHDRAW_WSTETH_SELECTOR,
};

// Function to dispatch calls from the ethereum app.
void dispatch_plugin_calls(int message, void *parameters) {
    switch (message) {
        case ETH_PLUGIN_INIT_CONTRACT:
            handle_init_contract(parameters);
            break;
        case ETH_PLUGIN_PROVIDE_PARAMETER:
            handle_provide_parameter(parameters);
            break;
        case ETH_PLUGIN_FINALIZE:
            handle_finalize(parameters);
            break;
        case ETH_PLUGIN_PROVIDE_INFO:
            handle_provide_token(parameters);
            break;
        case ETH_PLUGIN_QUERY_CONTRACT_ID:
            handle_query_contract_id(parameters);
            break;
        case ETH_PLUGIN_QUERY_CONTRACT_UI:
            handle_query_contract_ui(parameters);
            break;
        default:
            PRINTF("Unhandled message %d\n", message);
            break;
    }
}

void handle_query_ui_exception(unsigned int *args) {
    switch (args[0]) {
        case ETH_PLUGIN_QUERY_CONTRACT_UI:
            ((ethQueryContractUI_t *) args[1])->result = ETH_PLUGIN_RESULT_ERROR;
            break;
        default:
            break;
    }
}

// Calls the ethereum app.
void call_app_ethereum() {
    unsigned int libcall_params[5];
    libcall_params[0] = (unsigned int) "Ethereum";
    libcall_params[1] = 0x100;
    libcall_params[2] = RUN_APPLICATION;
    libcall_params[3] = (unsigned int) NULL;
#ifdef HAVE_NBGL
    caller_app_t capp;
    const char name[] = APPNAME;
    nbgl_icon_details_t icon_details;
    uint8_t bitmap[sizeof(ICONBITMAP)];

    memcpy(&icon_details, &ICONGLYPH, sizeof(ICONGLYPH));
    memcpy(&bitmap, &ICONBITMAP, sizeof(bitmap));
    icon_details.bitmap = (const uint8_t *) bitmap;
    capp.name = (const char *) name;
    capp.icon = &icon_details;
    libcall_params[4] = (unsigned int) &capp;
#else
    libcall_params[4] = (unsigned int) NULL;
#endif
    os_lib_call((unsigned int *) &libcall_params);
}

// Weird low-level black magic. No need to edit this.
__attribute__((section(".boot"))) int main(int arg0) {
    // Exit critical section
    __asm volatile("cpsie i");

    // Ensure exception will work as planned
    os_boot();

    // Try catch block. Please read the docs for more information on how to use those!
    BEGIN_TRY {
        TRY {
            // Low-level black magic.
            check_api_level(CX_COMPAT_APILEVEL);

            // Check if we are called from the dashboard.
            if (!arg0) {
                // Called from dashboard, launch Ethereum app
                call_app_ethereum();
                return 0;
            } else {
                // Not called from dashboard: called from the ethereum app!
                const unsigned int *args = (const unsigned int *) arg0;

                // If `ETH_PLUGIN_CHECK_PRESENCE` is set, this means the caller is just trying to
                // know whether this app exists or not. We can skip `dispatch_plugin_calls`.
                if (args[0] != ETH_PLUGIN_CHECK_PRESENCE) {
                    dispatch_plugin_calls(args[0], (void *) args[1]);
                }
            }
        }
        CATCH_OTHER(e) {
            switch (e) {
                // These exceptions are only generated on handle_query_contract_ui()
                case 0x6502:
                case EXCEPTION_OVERFLOW:
                    handle_query_ui_exception((unsigned int *) arg0);
                    break;
                default:
                    break;
            }
            PRINTF("Exception 0x%x caught\n", e);
        }
        FINALLY {
            // Call `os_lib_end`, go back to the ethereum app.
            os_lib_end();
        }
    }
    END_TRY;

    // Will not get reached.
    return 0;
}
