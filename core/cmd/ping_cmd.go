package cmd

import (
	"context"
	"fmt"

	"github.com/ethereum/go-ethereum/common"
	"github.com/spf13/cobra"

	"github.com/towns-protocol/towns/core/config"
	"github.com/towns-protocol/towns/core/node/crypto"
	"github.com/towns-protocol/towns/core/node/http_client"
	"github.com/towns-protocol/towns/core/node/infra"
	"github.com/towns-protocol/towns/core/node/nodes"
	"github.com/towns-protocol/towns/core/node/registries"
	"github.com/towns-protocol/towns/core/node/rpc"
)

func runPing(cfg *config.Config) error {
	ctx := context.Background() // lint:ignore context.Background() is fine here

	riverChain, err := crypto.NewBlockchain(
		ctx,
		&cfg.RiverChain,
		nil,
		infra.NewMetricsFactory(nil, "river", "cmdline"),
		nil,
	)
	if err != nil {
		return err
	}

	baseChain, err := crypto.NewBlockchain(
		ctx,
		&cfg.BaseChain,
		nil,
		infra.NewMetricsFactory(nil, "base", "cmdline"),
		nil,
	)
	if err != nil {
		return err
	}

	registryContract, err := registries.NewRiverRegistryContract(
		ctx,
		riverChain,
		&cfg.RegistryContract,
		&cfg.RiverRegistry,
	)
	if err != nil {
		return err
	}

	onChainConfig, err := crypto.NewOnChainConfig(
		ctx,
		riverChain.Client,
		registryContract.Address,
		riverChain.InitialBlockNum,
		riverChain.ChainMonitor,
	)
	if err != nil {
		return err
	}

	httpClient, err := http_client.GetHttpClient(ctx, cfg)
	if err != nil {
		return err
	}

	nodeRegistry, err := nodes.LoadNodeRegistry(
		ctx, registryContract, common.Address{}, riverChain.InitialBlockNum, riverChain.ChainMonitor, onChainConfig, httpClient, httpClient, nil)
	if err != nil {
		return err
	}

	result, err := rpc.GetRiverNetworkStatus(ctx, cfg, nodeRegistry, riverChain, baseChain, nil)
	if err != nil {
		return err
	}

	fmt.Println(result.ToPrettyJson())
	return nil
}

func init() {
	cmd := &cobra.Command{
		Use:   "ping",
		Short: "Pings all nodes in the network based on config and print the results as JSON",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runPing(cmdConfig)
		},
	}

	rootCmd.AddCommand(cmd)
}
