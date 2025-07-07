export default function ConnectButton() {
    return (
        <div
            style={{
                background: '#18181b', // preto escuro
                borderRadius: '1rem', // mais retangular, mas ainda arredondado
                padding: '1px 1px',    // máxima compactação
                display: 'inline-block',
            }}
        >
            <appkit-button data-connect />
        </div>
    )
}